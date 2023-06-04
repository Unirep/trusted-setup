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

  constructor(state) {
    makeAutoObservable(this)
    this.state = state
    this.load()
  }

  get authenticated() {
    return !!this.authToken
  }

  get inQueue() {
    return !!this.timeoutAt
  }

  get isActive() {
    return this.activeContributor === this.userId && !!this.userId
  }

  async load() {
    await this.connect()
    this.authToken = localStorage.getItem('authToken')
    if (!this.authenticated) await this.auth()
    const { data } = await this.client.send('user.info', {
      token: this.authToken,
    })
    this.queueLength = data.queueLength
    this.userId = data.userId
    this.activeContributor = data.activeContributor?.userId
    if (data.inQueue) {
      this.timeoutAt = data.timeoutAt
      this.startKeepalive()
    }
    if (data.active) {
      this.contribute()
    }
  }

  async join() {
    // join the queue
    const { data: _data } = await this.client.send('ceremony.join', {
      token: this.authToken,
    })
    this.timeoutAt = _data.timeoutAt
    // start the keepalive
    this.startKeepalive()
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
      for (const [circuitName, id] of Object.entries(
        data.latestContributions
      )) {
        console.log(circuitName, id)
        const latest = await this.downloadContribution(circuitName, id)
        const out = { type: 'mem' }
        if (this.activeContributor !== this.userId) break
        await snarkjs.zKey.contribute(
          latest,
          out,
          'contributor name' + Math.random(),
          Array(32)
            .fill(null)
            .map(() => randomf(2n ** 256n))
            .join('')
        )
        if (this.activeContributor !== this.userId) break
        await this.uploadContribution(out.data, circuitName)
      }
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
    if (this.keepaliveTimer) return
    if (!this.timeoutAt) throw new Error('No timeout known')
    this.keepaliveTimer = true
    const padding = 2000
    const nextPing = Math.max(0, +(this.timeoutAt - padding) - +new Date())
    for (;;) {
      if (!this.keepaliveTimer) return
      await new Promise((r) => setTimeout(r, nextPing))
      if (!this.keepaliveTimer) return
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
      }
    }
  }

  stopKeepalive() {
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
    this.client.listen('ceremonyState', ({ data }) => {
      this.ceremonyState = data
      this.activeContributor = data.activeContributor?.userId ?? 'none'
      this.queueLength = data.queueLength
    })
    this.client.listen('activeContributor', ({ data }) => {
      this.activeContributor = data.activeContributor?.userId ?? 'none'
      this.queueLength = data.queueLength
      if (this.isActive) this.contribute()
    })
    // const { data, message, status } = await this.client.send('info')
    // this.info = data
  }
}
