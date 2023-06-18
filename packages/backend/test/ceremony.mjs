import EspecialClient from 'especial/client.js'
import randomf from 'randomf'
import ws from 'ws'

export default class Ceremony {
  constructor({ WS_SERVER, HTTP_SERVER } = {}) {
    this.WS_SERVER = process.env.WS_SERVER ?? WS_SERVER
    this.HTTP_SERVER = process.env.HTTP_SERVER ?? HTTP_SERVER
  }

  async join(name, queueName) {
    this.contributionHashes = null
    this.contributionName = name.trim()
    // join the queue
    const { data: _data } = await this.client.send('ceremony.join', {
      token: this.authToken,
      queueName,
    })
    this.timeoutAt = _data.timeoutAt
    this.inQueue = true
    // start the keepalive
    this.startKeepalive()
    this.contributionUpdates = []
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
    this.authToken = data.token
    this.userId = data.userId
  }

  ingestState() {}

  async connect() {
    if (this.connected) return console.log('Already connected')
    try {
      const _client = new EspecialClient(this.WS_SERVER, ws)

      this.client = _client
      await _client.connect()
      this.connected = _client.connected
    } catch (err) {
      this.client = null
      throw err
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
