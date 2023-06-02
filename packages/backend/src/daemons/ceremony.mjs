export default class Ceremony {
  constructor(state) {
    this.state = state
    this.start()
  }

  async start() {
    for (;;) {
      await this.sendState()
      await new Promise((r) => setTimeout(r, 10000))
    }
  }

  // TODO: require queue members respond to a keepalive request or be removed from queue

  async sendState() {
    const activeContributer = await this.state.db.findOne('CeremonyQueue', {
      startedAt: { ne: null },
      completedAt: null,
    })
    const completedCount = await this.state.db.count('CeremonyQueue', {
      completedAt: { ne: null },
    })
    const queueLength = await this.state.db.count('CeremonyQueue', {
      startedAt: null,
    })
    console.log(await this.state.db.findMany('CeremonyQueue', { where: {} }))
    this.state.wsApp.broadcast('ceremonyState', {
      activeContributer: activeContributer
        ? {
            ...activeContributer,
            token: 'redacted',
          }
        : null,
      completedCount,
      queueLength,
    })
  }
}
