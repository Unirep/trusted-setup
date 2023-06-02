import EspecialClient from 'especial/client'
import { makeAutoObservable, makeObservable, observable } from 'mobx'
import { WS_SERVER } from '../config'

const CHANNEL_NAME = 'internal'

export default class Message {
  connection = null
  client = null
  keepaliveTimer = null
  connected = false
  info = {}
  authToken = null
  ceremonyState = {}
  queueLength = 0

  constructor(state) {
    makeAutoObservable(this)
    this.state = state
    this.load()
  }

  get authenticated() {
    return !!this.authToken
  }

  async load() {
    await this.connect()
    this.authToken = localStorage.getItem('authToken')
    if (!this.authenticated) await this.auth()
    const { data } = await this.client.send('user.info', {
      token: this.authToken,
    })
    console.log(data)
    if (!data.inQueue) {
      // join the queue
      await this.client.send('ceremony.join', {
        token: this.authToken,
      })
    }
  }

  async auth() {
    const { data } = await this.client.send('user.auth')
    console.log(data)
    localStorage.setItem('authToken', data.token)
    this.authToken = data.token
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
    this.keepaliveTimer = setInterval(
      () => this.client.send('ping'),
      5 * 60 * 1000
    )
    this.client.listen('ceremonyState', ({ data }) => {
      this.ceremonyState = data
      this.queueLength = data.queueLength
    })
    this.client.listen(
      'queueLength',
      ({ data }) => (this.queueLength = data.queueLength)
    )
    // const { data, message, status } = await this.client.send('info')
    // this.info = data
  }
}
