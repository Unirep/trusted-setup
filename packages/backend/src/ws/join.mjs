import { KEEPALIVE_INTERVAL, queues } from '../config.mjs'
import { catchErrorWs } from '../catchError.mjs'

export default ({ wsApp, db, ceremony }) => {
  wsApp.handle(
    'ceremony.join',
    catchErrorWs(async (data, send, next) => {
      const { token, queueName } = data
      if (!token) return send('no token', 1)
      const auth = await db.findOne('Auth', {
        where: { token },
      })
      if (!auth) return send('unauthorized', 1)
      const queue = queues.find(({ name }) => name === queueName)
      if (!queue) return send(`invalid queue name: "${queueName}"`, 1)
      // check the queue requirement
      if (queue.oauthRequire) {
        const oauth = await db.findOne('OAuth', {
          where: {
            ...queue.oauthRequire,
            userId: auth.userId,
          },
        })
        if (!oauth) {
          return send(`oauth requirement not met`, 1)
        }
      }
      const timeoutAt = await ceremony.addToQueue(auth.userId, queueName)
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
  )
}
