export default ({ wsApp, db, ceremony }) => {
  wsApp.handle('user.auth', async (data, send, next) => {
    // TODO: verify the user requesting authentication
    const auth = await db.create('Auth', {})
    send(auth)
  })
}
