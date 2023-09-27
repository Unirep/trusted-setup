import { TWITTER_CLIENT_ID, TWITTER_REDIRECT_URI } from '../config.mjs'
import fetch from 'node-fetch'
import crypto from 'crypto'
import { catchError } from '../catchError.mjs'

const TWITTER_URL = process.env.TWITTER_URL ?? 'https://twitter.com'
const TWITTER_API_URL = process.env.TWITTER_URL ?? 'https://api.twitter.com'

export default ({ app, wsApp, db, ceremony }) => {
  app.get(
    '/oauth/twitter',
    catchError(async (req, res) => {
      const { token, content } = req.query
      const auth = await db.findOne('Auth', {
        where: { token },
      })
      if (!auth) return res.status(401).json({ error: 'unauthorized' })

      const challenge = crypto.randomBytes(32).toString('hex')
      const state = await db.create('OAuthState', {
        type: 'twitter',
        data: `${challenge}&${content}`,
        redirectDestination: req.query.redirectDestination,
        userId: auth.userId,
      })
      const url = new URL('/i/oauth2/authorize', TWITTER_URL)
      url.searchParams.set('response_type', 'code')
      url.searchParams.set('client_id', TWITTER_CLIENT_ID)
      url.searchParams.set('redirect_uri', TWITTER_REDIRECT_URI)
      url.searchParams.set(
        'scope',
        'users.read tweet.read tweet.write offline.access'
      )
      url.searchParams.set('state', state._id)
      // PKCE thing
      url.searchParams.set('code_challenge', challenge)
      url.searchParams.set('code_challenge_method', 'plain')
      res.redirect(url.toString())
    })
  )

  app.get(
    '/oauth/twitter/callback',
    catchError(async (req, res) => {
      const { code, state, error } = req.query
      const _state = await db.findOne('OAuthState', {
        where: { _id: state },
      })
      if (!_state) {
        res.status(401).json({
          error: 'Invalid state',
        })
        return
      }
      await db.delete('OAuthState', {
        where: {
          _id: state,
        },
      })
      if (error) {
        // access was denied
        const url = new URL(_state.redirectDestination)
        url.searchParams.set('error', 'There was a problem authenticating you')
        res.redirect(url.toString())
        return
      }
      const challenge = _state.data.split('&')[0]
      const args = {
        code,
        grant_type: 'authorization_code',
        client_id: TWITTER_CLIENT_ID,
        code_verifier: challenge,
        redirect_uri: TWITTER_REDIRECT_URI,
      }
      const body = Object.entries(args)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&')

      const url = new URL('/2/oauth2/token', TWITTER_API_URL)
      const auth = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body,
      })

      const authOutcome = await auth.json()

      const apiurl = new URL('/2/tweets', TWITTER_API_URL)
      const text = _state.data.split('&')[1]
      console.log('text:', text)
      const data = {
        text,
      }

      const response = await fetch(apiurl.toString(), {
        method: 'POST',
        headers: {
          authorization: `Bearer ${authOutcome.access_token}`,
          'user-agent': 'v2CreateTweetJS',
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify(data),
      }).then((r) => r.json())
      console.log(response)

      if (!_state.redirectDestination) {
        res.status(204).end()
      } else {
        const _url = new URL(_state.redirectDestination)
        _url.searchParams.set('res', JSON.stringify(response))
        res.redirect(_url.toString())
      }
    })
  )

  // app.get(
  //   '/post/twitter',
  //   catchError(async (req, res) => {
  //     const { access_token, content } = req.query
  //     const data = {
  //       text: content
  //     }
  //     const url = new URL('/2/tweets', TWITTER_API_URL)

  //     const response = await fetch(url.toString(), {
  //         method: 'POST',
  //         headers: {
  //             authorization: `Bearer ${access_token}`,
  //             'user-agent': "v2CreateTweetJS",
  //             'content-type': "application/json",
  //             accept: "application/json"
  //         },
  //         body: data
  //     })
  //     console.log(response)
  //     res.json(response)
  //   })
  // )
}
