import randomf from 'randomf'
import { GITHUB_CLIENT_ID } from '../config.mjs'
import fetch from 'node-fetch'

const GITHUB_URL = process.env.GITHUB_URL ?? 'https://github.com'
const GITHUB_API_URL = process.env.GITHUB_URL ?? 'https://api.github.com'

export default class DeviceFlowAuth {
  constructor(db) {
    this.db = db
  }

  async start() {
    const id = randomf(2n ** 256n).toString()
    this.id = id

    for (;;) {
      try {
        await this._poll(id)
      } catch (err) {
        console.log('Poll error')
        console.log(err)
      }
      if (this.id !== id) return
      await new Promise((r) => setTimeout(r, 10000))
    }
  }

  async _poll(id) {
    if (id !== this.id) return
    await this.db.delete('DeviceFlowAuth', {
      where: {
        expiresAt: { lte: +new Date() },
      },
    })
    if (id !== this.id) return
    const entries = await this.db.findMany('DeviceFlowAuth', {
      where: {
        nextPoll: { lte: +new Date() },
      },
    })
    for (const entry of entries) {
      try {
        await this._login(entry)
      } catch (err) {
        console.log(err)
        console.log('Error in device flow polling')
      }
    }
  }

  async _login(entry) {
    if (+new Date() <= entry.lastPoll + entry.pollInterval) return
    // otherwise we can poll
    const url = new URL('/login/oauth/access_token', GITHUB_URL)
    url.searchParams.append('client_id', GITHUB_CLIENT_ID)
    url.searchParams.append('device_code', entry.deviceCode)
    url.searchParams.append(
      'grant_type',
      'urn:ietf:params:oauth:grant-type:device_code'
    )
    const r = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
    })
    const data = await r.json()
    if (data.error === 'authorization_pending') {
      await this.db.update('DeviceFlowAuth', {
        where: {
          _id: entry._id,
        },
        update: {
          nextPoll: +new Date() + entry.pollInterval,
        },
      })
      return
    }
    const { access_token, token_type, scope } = data
    await this.db.delete('DeviceFlowAuth', {
      where: { _id: entry._id },
    })
    const apiUrl = new URL('/user', GITHUB_API_URL)
    const user = await fetch(apiUrl.toString(), {
      headers: {
        authorization: `token ${access_token}`,
      },
    }).then((r) => r.json())
    if (!user.id) {
      // TODO
      console.log('no user id received')
      return
    }
    // end oauth logic
    const signupId = `github-${user.id}`
    const existingAuth = await this.db.findOne('OAuth', {
      where: {
        _id: signupId,
      },
    })
    if (existingAuth) {
      await this.db.update('CeremonyQueue', {
        where: {
          userId: entry.userId,
          completedAt: null,
        },
        update: {
          completedAt: +new Date(),
          prunedAt: +new Date(),
        },
      })
      await this.db.delete('OAuth', {
        where: {
          _id: signupId,
        },
      })
    }
    const signupAt = new Date(user.created_at)
    await this.db.create('OAuth', {
      _id: signupId,
      userId: entry.userId,
      accountAgeMs: Math.max(0, +new Date() - +signupAt),
      type: 'github',
    })
  }

  stop() {
    this.id = null
  }
}
