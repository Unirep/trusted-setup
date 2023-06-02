// credit https://github.com/Prioe/node-fetch-progress

import bytes from 'bytes'
import EventEmitter from 'events'

export default class Download extends EventEmitter {
  constructor(response, options) {
    super()
    this.options = options || {}
    this.length = Number(response.headers.get('content-length'))
    this.startedAt = Date.now()

    this.response = response
    this.reader = response.body.getReader()

    this.loading = true
  }

  async download() {
    let received = 0
    const chunks = []
    while (this.loading) {
      const { done, value } = await this.reader.read()
      if (done) {
        this.loading = false
        this.emit('progress', {
          done: true,
        })
      } else {
        chunks.push(value)
        received += value.length
        this.emit('progress', {
          progress: Math.floor(100000 * (received / this.length)) / 1000,
        })
      }
    }
    const body = new Uint8Array(received)
    let position = 0

    for (const chunk of chunks) {
      body.set(chunk, position)
      position += chunk.length
    }
    return body
  }
}
