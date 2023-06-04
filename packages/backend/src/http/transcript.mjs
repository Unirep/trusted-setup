import path from 'path'
import { dbpath, contribpath, circuits } from '../config.mjs'

export default ({ app, db, ceremony }) => {
  app.get('/transcript', async (req, res) => {
    try {
      const contributions = await db.findMany('Contribution', {
        where: {},
        orderBy: { index: 'desc' },
      })
      res.set('content-type', 'application/json')
      res.json(contributions)
    } catch (err) {
      console.log(err)
      res.status(500).end(err)
    }
  })
}
