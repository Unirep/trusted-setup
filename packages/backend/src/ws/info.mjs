export default ({ wsApp, db, ceremony }) => {
  wsApp.handle('user.info', async (data, send, next) => {
    const { token } = data
    if (!token) return send(1, 'No token')
    const auth = await db.findOne('Auth', {
      where: { token },
    })
    if (!auth) return send(1, 'unauthorized')
    const queueEntry = await db.findOne('CeremonyQueue', {
      where: {
        token,
      },
    })
    send({
      inQueue: !!queueEntry,
    })
  })
}
