import { catchErrorWs } from '../catchError.mjs'

export default ({ wsApp, db, ceremony }) => {
  wsApp.handle(
    'user.register',
    catchErrorWs(async (data, send, next) => {
      const user = await db.create('User', {})
      const auth = await db.create('Auth', {
        userId: user._id,
      })
      send(auth)
    })
  )
}
