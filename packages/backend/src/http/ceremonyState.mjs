import { catchError } from '../catchError.mjs'

export default ({ app, db, ceremony }) => {
  app.get(
    '/ceremony',
    catchError(async (req, res) => {
      res.json(await ceremony.buildState())
    })
  )
}
