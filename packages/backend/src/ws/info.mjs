import { circuits } from '../config.mjs'

export default ({ wsApp, db, ceremony }) => {
  wsApp.handle('user.info', async (data, send, next) => {
    const { token } = data
    if (!token) return send('no token', 1)
    const auth = await db.findOne('Auth', {
      where: { token },
    })
    if (!auth) return send('unauthorized', 1)
    const queueEntry = await db.findOne('CeremonyQueue', {
      where: {
        userId: auth.userId,
        completedAt: null,
      },
    })

    const latestContributions = {}
    for (const circuit of circuits) {
      const { name } = circuit
      const latestContribution = await db.findOne('Contribution', {
        where: {
          circuitName: name,
        },
        orderBy: {
          index: 'desc',
        },
      })
      latestContributions[name] = latestContribution?._id ?? 'genesis'
    }
    const activeContributor = await ceremony.activeContributor()
    send({
      activeContributor,
      active: activeContributor?._id === queueEntry?._id && activeContributor,
      inQueue: !!queueEntry,
      timeoutAt: queueEntry?.timeoutAt,
      latestContributions,
      queueLength: await ceremony.queueLength(),
      userId: auth.userId,
      queueEntry,
    })
  })
}
