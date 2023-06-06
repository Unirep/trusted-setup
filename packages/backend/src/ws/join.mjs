import { KEEPALIVE_INTERVAL } from '../config.mjs'

export default ({ wsApp, db, ceremony }) => {
  wsApp.handle('ceremony.join', async (data, send, next) => {
    const { token } = data
    if (!token) return send('no token', 1)
    const auth = await db.findOne('Auth', {
      where: { token },
    })
    if (!auth) return send('unauthorized', 1)
    const timeoutAt = await ceremony.addToQueue(auth.userId)
    const activeContributor = await ceremony.activeContributor()
    const queuePosition = await db.count('CeremonyQueue', {
      completedAt: null,
    })

    send({
      timeoutAt,
      active: activeContributor?.userId === auth.userId,
      queuePosition,
    })
  })
}
