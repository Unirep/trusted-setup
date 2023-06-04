export default ({ wsApp, db, ceremony }) => {
  wsApp.handle('ceremony.state', async (data, send, next) => {
    send(await ceremony.buildState())
  })
}
