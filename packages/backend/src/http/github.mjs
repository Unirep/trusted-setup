import {
  GITHUB_CLIENT_ID,
  GITHUB_REDIRECT_URI,
  GITHUB_CLIENT_SECRET,
} from '../config.mjs'
import fetch from 'node-fetch'
import { catchError } from '../catchError.mjs'
import { Octokit } from 'octokit'

const GITHUB_URL = process.env.GITHUB_URL ?? 'https://github.com'
const GITHUB_API_URL = process.env.GITHUB_URL ?? 'https://api.github.com'

async function post(access_token, content) {
  const octokit = new Octokit({
    request: {
      fetch: fetch,
    },
    auth: access_token,
  })

  const filename = `unirep-trusted-setup-${+new Date()}.log`
  const data = {
    description: 'Post of Unirep trusted setup',
    files: {},
    headers: {
      'x-github-api-version': '2022-11-28',
    },
  }
  data.files[filename] = {
    content,
  }

  const response = await octokit.request('POST /gists', data)
  return response.data.html_url
}

export default ({ app, wsApp, db, ceremony }) => {
  app.get(
    '/oauth/github',
    catchError(async (req, res) => {
      const { token, content } = req.query
      const auth = await db.findOne('Auth', {
        where: { token },
      })
      if (!auth) return res.status(401).json({ error: 'unauthorized' })
      const state = await db.create('OAuthState', {
        type: 'github',
        redirectDestination: req.query.redirectDestination,
        userId: auth.userId,
        data: content,
      })
      const url = new URL('/login/oauth/authorize', GITHUB_URL)
      url.searchParams.set('client_id', GITHUB_CLIENT_ID)
      url.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI)
      url.searchParams.set('scope', 'gist')
      url.searchParams.set('state', state._id)
      url.searchParams.set('allow_signup', 'false')
      res.redirect(url.toString())
    })
  )

  app.get(
    '/oauth/github/callback',
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
      const url = new URL('/login/oauth/access_token', GITHUB_URL)
      url.searchParams.set('client_id', GITHUB_CLIENT_ID)
      url.searchParams.set('client_secret', GITHUB_CLIENT_SECRET)
      url.searchParams.set('code', code)
      const auth = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          accept: 'application/json',
        },
      })
      const { access_token } = await auth.json()
      const apiUrl = new URL('/user', GITHUB_API_URL)
      const user = await fetch(apiUrl.toString(), {
        headers: {
          authorization: `token ${access_token}`,
        },
      }).then((r) => r.json())
      if (!user.id) {
        const _url = new URL(_state.redirectDestination)
        _url.searchParams.append('error', 'Unknown problem')
        res.redirect(_url.toString())
        return
      }
      // end oauth logic
      const signupId = `github-${user.id}`
      const existingAuth = await db.findOne('OAuth', {
        where: {
          _id: signupId,
        },
      })
      if (existingAuth) {
        await db.update('CeremonyQueue', {
          where: {
            userId: existingAuth.userId,
            completedAt: null,
          },
          update: {
            completedAt: +new Date(),
            prunedAt: +new Date(),
          },
        })
        await db.delete('OAuth', {
          where: {
            _id: signupId,
          },
        })
      }
      const signupAt = new Date(user.created_at)
      await db.create('OAuth', {
        _id: signupId,
        userId: _state.userId,
        accountAgeMs: Math.max(0, +new Date() - +signupAt),
        type: 'github',
      })

      let postUrl
      if (_state.data) {
        postUrl = await post(access_token, _state.data)
      }

      if (!_state.redirectDestination) {
        res.status(204).end()
      } else {
        const _url = new URL(_state.redirectDestination)
        _url.searchParams.set('github_access_token', access_token)
        _url.searchParams.set('name', `Github#${user.login}`)
        if (postUrl) {
          _url.searchParams.set('gist_post_url', postUrl)
        }
        res.redirect(_url.toString())
      }
    })
  )

  app.get(
    '/post/github',
    catchError(async (req, res) => {
      const { access_token, content } = req.query
      const url = await post(access_token, content)
      res.json({ url })
    })
  )
}
