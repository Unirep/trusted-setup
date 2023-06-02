export default ({ wsApp, db, ceremony }) => {
  wsApp.handle('ceremony.join', async (data, send, next) => {
    const { token } = data
    if (!token) return send(1, 'No token')
    const auth = await db.findOne('Auth', {
      where: { token },
    })
    if (!auth) return send(1, 'unauthorized')
    await db.transaction(async (_db) => {
      const existing = await db.findOne('CeremonyQueue', {
        where: {
          token,
          completedAt: null,
        },
      })
      if (existing) throw new Error('Already in queue')
      const index = await db.count('CeremonyQueue', {})
      _db.create('CeremonyQueue', {
        token,
        index,
      })
    })
    const queueLength = await db.count('CeremonyQueue', {})
    wsApp.broadcast('queueLength', { queueLength })
    send(0)
  })
}
