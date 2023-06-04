export default ({ app, db, ceremony }) => {
  app.get('/ceremony', async (req, res) => {
    try {
      res.json(await ceremony.buildState())
    } catch (err) {
      console.log(err)
      res.status(500).end(err)
    }
  })
}
