import path from 'path'
import { dbpath, contribpath, circuits } from '../config.mjs'
import { catchError } from '../catchError.mjs'

export default ({ app, db, ceremony }) => {
  app.get(
    '/transcript',
    catchError(async (req, res) => {
      const { afterTimestamp } = req.query
      const contributions = await db.findMany('Contribution', {
        where: {
          createdAt: afterTimestamp ? { gte: +afterTimestamp } : undefined,
        },
        orderBy: { index: 'desc' },
      })
      res.set('content-type', 'application/json')
      res.json(contributions)
    })
  )
}
