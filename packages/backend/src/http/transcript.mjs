import { dbpath } from '../config.mjs'

export default ({ app, db, ceremony }) => {
  app.get('/contribution/:id', async (req, res) => {
    try {
      const { token } = req.params
      if (!token) return res.status(401).json({ error: 'No token' })
      const auth = await db.findOne('Auth', {
        where: { token },
      })
      if (!auth) return send(1, 'unauthorized')
      // TODO: load from file system and pipe to response
      res.status(404).text('not built')
    } catch (err) {
      console.log(err)
      res.status(500).end(err)
    }
  })
}
