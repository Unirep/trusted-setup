import {
  circuits,
  KEEPALIVE_INTERVAL,
  CONTRIBUTION_TIMEOUT,
} from '../config.mjs'

export default class Ceremony {
  constructor(state) {
    this.state = state
    this.start()
  }

  async start() {
    for (;;) {
      await this.pruneQueue()
      await new Promise((r) => setTimeout(r, 5000))
    }
  }

  async startPrune() {
    for (;;) {
      await new Promise((r) => setTimeout(r, 10000))
    }
  }

  async activeContributor() {
    const activeContributor = await this.state.db.findOne('CeremonyQueue', {
      where: {
        startedAt: { ne: null },
        completedAt: null,
      },
    })
    return activeContributor
  }

  async queueLength() {
    return this.state.db.count('CeremonyQueue', {
      completedAt: null,
    })
  }

  async updateActiveContributor() {
    const activeContributor = await this.activeContributor()
    if (activeContributor) return
    await this.state.db.transaction(async (_db) => {
      const next = await this.state.db.findOne('CeremonyQueue', {
        where: {
          startedAt: null,
          completedAt: null,
        },
        orderBy: {
          index: 'asc',
        },
      })
      // queue is empty
      if (!next) return
      _db.update('CeremonyQueue', {
        where: {
          _id: next._id,
        },
        update: {
          startedAt: +new Date(),
        },
      })
    })
    this.state.wsApp.broadcast('activeContributor', {
      activeContributor: await this.activeContributor(),
      queueLength: await this.queueLength(),
    })
  }

  async addToQueue(userId) {
    let timeoutAt
    await this.state.db.transaction(async (_db) => {
      const existing = await this.state.db.findOne('CeremonyQueue', {
        where: {
          userId,
          completedAt: null,
        },
      })
      if (existing) throw new Error('Already in queue')
      const index = await this.state.db.count('CeremonyQueue', {})
      timeoutAt = +new Date() + KEEPALIVE_INTERVAL
      _db.create('CeremonyQueue', {
        userId,
        index,
        timeoutAt,
      })
      console.log('added queue entry')
    })
    await this.updateActiveContributor()
    return timeoutAt
  }

  async removeFromQueue(userId) {
    await this.state.db.update('CeremonyQueue', {
      where: {
        userId,
        completedAt: null,
      },
      update: {
        completedAt: +new Date(),
      },
    })
    await this.updateActiveContributor()
    // TODO: use a lock for the prune system
    this.state.wsApp.broadcast('activeContributor', {
      activeContributor: await this.activeContributor(),
      queueLength: await this.queueLength(),
    })
  }

  // remove members that have not sent a keepalive
  // TODO: figure out how contributors will handle this
  async pruneQueue() {
    const prunedCount = await this.state.db.update('CeremonyQueue', {
      where: {
        completedAt: null,
        timeoutAt: {
          lt: +new Date(),
        },
      },
      update: {
        completedAt: +new Date(),
      },
    })
    if (prunedCount > 0) {
      console.log(`pruned ${prunedCount} entries`)
    }
    const currentContributor = await this.activeContributor()
    if (
      currentContributor &&
      currentContributor.startedAt + CONTRIBUTION_TIMEOUT <= +new Date()
    ) {
      await this.state.db.update('CeremonyQueue', {
        where: {
          _id: currentContributor._id,
        },
        update: {
          completedAt: +new Date(),
        },
      })
    }
    await this.updateActiveContributor()
    await this.sendState()
  }

  async buildState() {
    const activeContributor = await this.activeContributor()
    const completedCount = await this.state.db.count('CeremonyQueue', {
      completedAt: { ne: null },
    })
    const queueLength = await this.queueLength()
    const circuitStats = await Promise.all(
      circuits.map(async (c) => ({
        name: c.name,
        contributionCount: await this.state.db.count('Contribution', {
          circuitName: c.name,
        }),
      }))
    )
    return {
      activeContributor,
      completedCount,
      queueLength,
      circuitStats,
    }
  }

  async sendState() {
    this.state.wsApp.broadcast('ceremonyState', await this.buildState())
  }
}
