import { KEEPALIVE_INTERVAL } from '../config.mjs'

export default ({ wsApp, db, ceremony }) => {
  wsApp.handle('ceremony.keepalive', async (data, send, next) => {
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
    if (!queueEntry) return send('not in queue', 1)
    const timeoutAt = +new Date() + KEEPALIVE_INTERVAL
    await db.update('CeremonyQueue', {
      where: {
        _id: queueEntry._id,
      },
      update: {
        timeoutAt,
      },
    })
    send({
      timeoutAt,
    })
  })
}
