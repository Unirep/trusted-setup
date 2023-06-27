import crypto from 'crypto'
import fetch from 'node-fetch'
import {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
} from '../config.mjs'
import { catchError } from '../catchError.mjs'

const DISCORD_URL = 'https://discord.com/api/'

export default ({ app, db, ceremony }) => {
  app.get(
    '/oauth/discord',
    catchError(async (req, res) => {
      const { token } = req.query
      const auth = await db.findOne('Auth', {
        where: { token },
      })
      if (!auth) return res.status(401).json({ error: 'unauthorized' })
      const _state = await db.create('OAuthState', {
        type: 'discord',
        redirectDestination: req.query.redirectDestination,
        userId: auth.userId,
      })
      const url = new URL('https://discord.com/oauth2/authorize')
      url.searchParams.append('response_type', 'code')
      url.searchParams.append('client_id', DISCORD_CLIENT_ID)
      url.searchParams.append('redirect_uri', DISCORD_REDIRECT_URI)
      url.searchParams.append('scope', 'identify guilds')
      url.searchParams.append('state', _state._id)
      res.redirect(url.toString())
    })
  )

  app.get(
    '/oauth/discord/callback',
    catchError(async (req, res) => {
      const { state, code, error } = req.query
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
        url.searchParams.append(
          'error',
          'There was a problem authenticating you'
        )
        res.redirect(url.toString())
        return
      }
      const args = {
        code,
        grant_type: 'authorization_code',
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        redirect_uri: DISCORD_REDIRECT_URI,
      }
      const body = Object.entries(args)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&')
      const auth = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body,
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      }).then((r) => r.json())
      //
      const meUrl = new URL('users/@me', DISCORD_URL)
      const guildsUrl = new URL('users/@me/guilds', DISCORD_URL)
      const [user, guilds] = await Promise.all([
        fetch(meUrl.toString(), {
          headers: {
            authorization: `Bearer ${auth.access_token}`,
          },
        }).then((r) => r.json()),
        fetch(guildsUrl.toString(), {
          headers: {
            authorization: `Bearer ${auth.access_token}`,
          },
        }).then((r) => r.json()),
      ])
      if (!user.id) {
        const url = new URL(_state.redirectDestination)
        url.searchParams.append('error', 'Unknown problem')
        res.redirect(url.toString())
        return
      }
      // end oauth logic
      // generate a signup code and give it to the user
      // prevent double signup
      const signupId = `discord-${user.id}`
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
      // discord doesn't give us a signup at indicator
      await db.create('OAuth', {
        _id: signupId,
        userId: _state.userId,
        accountAgeMs: 0,
        type: 'discord',
      })
      if (!_state.redirectDestination) {
        res.status(204).end()
      } else {
        const url = new URL(_state.redirectDestination)
        res.redirect(url.toString())
      }
    })
  )
}
