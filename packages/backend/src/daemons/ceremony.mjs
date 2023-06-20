import {
  circuits,
  KEEPALIVE_INTERVAL,
  CONTRIBUTION_TIMEOUT,
  PRUNE_INTERVAL,
  queues,
} from '../config.mjs'

export default class Ceremony {
  constructor(state) {
    this.state = state
    this.start()
  }

  async start() {
    for (;;) {
      await this.pruneQueue()
      await new Promise((r) => setTimeout(r, PRUNE_INTERVAL))
    }
  }

  async activeContributor() {
    const activeContributor = await this.state.db.findOne('CeremonyQueue', {
      where: {
        startedAt: { ne: null },
        completedAt: null,
        name: queues.map(({ name }) => name),
      },
    })
    return activeContributor
  }

  async queueLength() {
    return this.state.db.count('CeremonyQueue', {
      completedAt: null,
      name: queues.map(({ name }) => name),
    })
  }

  async updateActiveContributor() {
    const activeContributor = await this.activeContributor()
    if (activeContributor) return
    await this.state.db.transaction(async (_db) => {
      const prev = await this.state.db.findOne('CeremonyQueue', {
        where: {
          completedAt: { ne: null },
          name: queues.map(({ name }) => name),
          prunedAt: null,
        },
        orderBy: {
          completedAt: 'desc',
        },
      })
      let activeQueueIndex = 0
      if (prev) {
        const lastQueueIndex = queues.findIndex(
          ({ name }) => name === prev.name
        )
        activeQueueIndex = (lastQueueIndex + 1) % queues.length
      }
      const nextByQueue = await Promise.all(
        queues.map(({ name }) =>
          this.state.db.findOne('CeremonyQueue', {
            where: {
              startedAt: null,
              completedAt: null,
              name,
            },
            orderBy: {
              index: 'asc',
            },
          })
        )
      )
      for (let x = 0; x < queues.length; x++) {
        const next = nextByQueue[(activeQueueIndex + x) % queues.length]
        if (!next) continue
        _db.update('CeremonyQueue', {
          where: {
            _id: next._id,
          },
          update: {
            startedAt: +new Date(),
          },
        })
        break
      }
    })
    this.state.wsApp.broadcast('activeContributor', {
      activeContributor: await this.activeContributor(),
      queueLength: await this.queueLength(),
    })
  }

  async addToQueue(userId, queueName) {
    let timeoutAt
    const queue = queues.find(({ name }) => name === queueName)
    if (!queue) {
      throw new Error(`Invalid queue name: "${queueName}`)
    }
    await this.state.db.transaction(async (_db) => {
      const existing = await this.state.db.findOne('CeremonyQueue', {
        where: {
          userId,
          completedAt: null,
          name: queues.map(({ name }) => name),
        },
      })
      if (existing) throw new Error('Already in a queue')
      const index = await this.state.db.count('CeremonyQueue', {})
      timeoutAt = +new Date() + KEEPALIVE_INTERVAL
      _db.create('CeremonyQueue', {
        userId,
        index,
        timeoutAt,
        name: queueName,
      })
      if (!process.env.CI) console.log('added queue entry')
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
        prunedAt: +new Date(),
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
    const currentContributor = await this.activeContributor()
    const prunedCount = await this.state.db.update('CeremonyQueue', {
      where: {
        completedAt: null,
        timeoutAt: {
          lt: +new Date(),
        },
        _id: currentContributor ? { ne: currentContributor._id } : undefined,
      },
      update: {
        prunedAt: +new Date(),
        completedAt: +new Date(),
      },
    })
    if (prunedCount > 0) {
      console.log(`pruned ${prunedCount} entries`)
    }
    if (
      currentContributor &&
      (currentContributor.startedAt + CONTRIBUTION_TIMEOUT <= +new Date() ||
        currentContributor.timeoutAt < +new Date())
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
    const queueLengths = await Promise.all(
      queues.map(({ name }) =>
        this.state.db
          .count('CeremonyQueue', {
            completedAt: null,
            name,
          })
          .then((count) => ({ name, count }))
      )
    )
    return {
      transcriptLength: await this.state.db.count('Contribution', {}),
      activeContributor,
      completedCount,
      queueLength,
      queueLengths,
      circuitStats,
    }
  }

  async sendState() {
    this.state.wsApp.broadcast('ceremonyState', await this.buildState())
  }
}
