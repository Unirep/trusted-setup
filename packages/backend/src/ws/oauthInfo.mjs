export default ({ wsApp, db, ceremony }) => {
  wsApp.handle('user.oauth.info', async (data, send, next) => {
    const { token } = data
    if (!token) return send('no token', 1)
    const auth = await db.findOne('Auth', {
      where: { token },
    })
    if (!auth) return send('unauthorized', 1)
    const oauths = await db.findMany('OAuth', {
      where: {
        userId: auth.userId,
      },
    })
    send(oauths)
  })
}
