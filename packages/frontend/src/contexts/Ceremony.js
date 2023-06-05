import EspecialClient from 'especial/client'
import { makeAutoObservable, makeObservable, observable } from 'mobx'
import { WS_SERVER, SERVER } from '../config'
import randomf from 'randomf'

export default class Queue {
  connection = null
  client = null
  keepaliveTimer = null
  connected = false
  authToken = null
  userId = null
  ceremonyState = {}
  queueLength = 0
  timeoutAt = null
  activeContributor = null
  contributing = false
  contributionName = null
  contributionHashes = null
  loadingInitial = true
  inQueue = false

  contributionUpdates = []

  constructor(state) {
    makeAutoObservable(this)
    this.state = state
    this.load()
  }

  get authenticated() {
    return !!this.authToken
  }

  get isActive() {
    return this.activeContributor === this.userId && !!this.userId
  }

  get contributionText() {
    const hashText = Object.entries(this.contributionHashes ?? {})
      .map(([circuitName, hash]) => `${circuitName}: ${hash}`)
      .join('\n\n')
    return `I just contributed to the unirep dev trusted setup ceremony. You can too [here](https://dev.trusted-setup.unirep.io).
My circuit hashes are as follows:

${hashText}
    `
  }

  async load() {
    if (window.CEREMONY_STATE) {
      this.ingestState(JSON.parse(window.CEREMONY_STATE))
    }
    await this.connect()
    this.authToken = localStorage.getItem('authToken')
    // don't block here
    this.loadState().catch(console.log)
    if (!this.authenticated) await this.auth()
    const { data } = await this.client.send('user.info', {
      token: this.authToken,
    })
    this.inQueue = data.inQueue
    if (data.inQueue) {
      this.timeoutAt = data.timeoutAt
      this.startKeepalive()
    }
    this.userId = data.userId
    if (data.active) {
      this.contribute()
    }
    this.loadingInitial = false
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('starting keepalive')
        this.startKeepalive()
      } else {
        // leave the queue if the page is minimized or tabbed out of
        console.log('stopping keepalive')
        this.stopKeepalive()
      }
    })
  }

  async loadState() {
    const { data } = await this.client.send('ceremony.state')
    this.ingestState(data)
  }

  async join(name) {
    this.contributionHashes = null
    this.contributionName = name.trim()
    // join the queue
    const { data: _data } = await this.client.send('ceremony.join', {
      token: this.authToken,
    })
    this.timeoutAt = _data.timeoutAt
    this.inQueue = true
    // start the keepalive
    this.startKeepalive()
    this.contributionUpdates = []
  }

  updateContributionStatus(text) {
    this.contributionUpdates = [...this.contributionUpdates, text]
  }

  async contribute() {
    if (this.contributing) return
    this.contributing = true
    console.log('starting contribution')
    try {
      const snarkjs = await import('snarkjs')
      const { data } = await this.client.send('user.info', {
        token: this.authToken,
      })
      const downloadPromises = Object.entries(data.latestContributions).reduce(
        (acc, [circuitName, id]) => {
          this.updateContributionStatus(
            `Downloading ${circuitName} last contribution`
          )
          return {
            ...acc,
            [circuitName]: this.downloadContribution(circuitName, id),
          }
        },
        {}
      )
      const uploadPromises = []
      const contributionHashes = {}
      for (const [circuitName, id] of Object.entries(
        data.latestContributions
      )) {
        console.log(circuitName, id)
        const latest = await downloadPromises[circuitName]
        const out = { type: 'mem' }
        if (this.activeContributor !== this.userId) break
        this.updateContributionStatus(`Computing ${circuitName} contribution`)
        const hash = await snarkjs.zKey.contribute(
          latest,
          out,
          this.contributionName || 'anonymous contributor',
          Array(32)
            .fill(null)
            .map(() => randomf(2n ** 256n))
            .join('')
        )
        if (this.activeContributor !== this.userId) break
        this.updateContributionStatus(`Uploading ${circuitName} contribution`)
        uploadPromises.push(this.uploadContribution(out.data, circuitName))
        contributionHashes[circuitName] = formatHash(hash)
      }
      try {
        await Promise.all(uploadPromises)
      } catch (_err) {
        console.log(_err)
        console.log('Contribution upload failed')
        this.updateContributionStatus(
          `! One or more contributions failed to process !`
        )
      }
      this.contributionHashes = contributionHashes
      this.stopKeepalive()
      this.timeoutAt = null
      this.contributing = false
    } catch (err) {
      console.log('Error making contribution')
      console.log(err)
      this.contributing = false
    }
  }

  async downloadContribution(circuitName, id) {
    const url = new URL(`/contribution/${id}`, SERVER)
    url.searchParams.set('circuitName', circuitName)
    url.searchParams.set('token', this.authToken)
    const res = await fetch(url.toString())
    const data = await res.arrayBuffer()
    return new Uint8Array(data)
  }

  async uploadContribution(data, circuitName) {
    const url = new URL(`/contribution`, SERVER)
    const formData = new FormData()
    formData.append('contribution', new Blob([data]))
    formData.append('token', this.authToken)
    formData.append('circuitName', circuitName)
    await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    })
  }

  async startKeepalive() {
    if (!this.connected) throw new Error('Not connected')
    const _keepaliveTimer = randomf(2n ** 256n).toString(16)
    this.keepaliveTimer = _keepaliveTimer
    if (!this.timeoutAt) {
      const { data } = await this.client.send('user.info', {
        token: this.authToken,
      })
      this.inQueue = data.inQueue
      if (!data.inQueue) {
        console.log('Not in queue. Stopping keepalive')
        this.keepaliveTimer = null
        return
      }
      if (this.keepaliveTimer !== _keepaliveTimer) return
      this.timeoutAt = data.timeoutAt
    }
    const padding = 5000
    for (;;) {
      const nextPing = Math.max(0, +(this.timeoutAt - padding) - +new Date())
      if (this.keepaliveTimer !== _keepaliveTimer) return
      await new Promise((r) => setTimeout(r, nextPing))
      if (this.keepaliveTimer !== _keepaliveTimer) return
      console.log('sending keepalive')
      try {
        const { data } = await this.client.send('ceremony.keepalive', {
          token: this.authToken,
        })
        this.timeoutAt = data.timeoutAt
      } catch (err) {
        console.log('Keepalive errored')
        console.log(err)
        this.keepaliveTimer = null
        this.timeoutAt = null
        this.inQueue = false
      }
    }
  }

  stopKeepalive() {
    this.timeoutAt = null
    this.keepaliveTimer = null
  }

  async auth() {
    const { data } = await this.client.send('user.register')
    localStorage.setItem('authToken', data.token)
    this.authToken = data.token
    this.userId = data.userId
  }

  async send(text) {
    const { publicSignals, proof } = await this.state.auth.proveAddressData(
      text
    )
    await this.client.send('create.message', {
      text,
      publicSignals,
      proof,
      channelName: this.activeChannel,
    })
  }

  ingestState(data) {
    this.ceremonyState = data
    this.activeContributor = data.activeContributor?.userId ?? 'none'
    this.queueLength = data.queueLength
  }

  async connect() {
    if (this.connected) return console.log('Already connected')
    try {
      const _client = new EspecialClient(WS_SERVER)
      makeObservable(_client, {
        connected: observable,
      })

      this.client = _client
      await _client.connect()
      this.connected = _client.connected
    } catch (err) {
      this.client = null
      return
    }
    this.client.addConnectedHandler(() => {
      this.connected = this.client.connected
    })
    // this.client.listen('msg', ({ data }) => this.ingestMessages(data))
    this.client.listen('ceremonyState', ({ data }) => this.ingestState(data))
    this.client.listen('activeContributor', ({ data }) => {
      this.activeContributor = data.activeContributor?.userId ?? 'none'
      this.queueLength = data.queueLength
      if (this.isActive) this.contribute()
    })
    // const { data, message, status } = await this.client.send('info')
    // this.info = data
  }
}

function formatHash(b) {
  if (!b) return null
  const a = new DataView(b.buffer, b.byteOffset, b.byteLength)
  let S = ''
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      S += a
        .getUint32(i * 16 + j * 4)
        .toString(16)
        .padStart(8, '0')
    }
  }
  return S
}
