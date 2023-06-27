import { catchErrorWs } from '../catchError.mjs'

export default ({ wsApp, db, ceremony }) => {
  wsApp.handle(
    'ceremony.state',
    catchErrorWs(async (data, send, next) => {
      send(await ceremony.buildState())
    })
  )
}
