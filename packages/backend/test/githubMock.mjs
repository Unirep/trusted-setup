import express from 'express'
import getPort from 'get-port'
import { nanoid } from 'nanoid'

const app = express()

const validCodes = {}
const validTokens = {}

app.use('*', (req, res, next) => {
  res.set('access-control-allow-origin', '*')
  res.set('access-control-allow-headers', '*')
  next()
})
app.use(express.json())

app.get('/login/oauth/authorize', async (req, res) => {
  const { redirect_uri, state } = req.query

  const code = nanoid()
  validCodes[code] = true

  const url = new URL(redirect_uri)
  url.searchParams.append('code', code)
  url.searchParams.append('state', state)

  res.redirect(url.toString())
})

app.post('/login/oauth/access_token', async (req, res) => {
  const { client_id, client_secret, code } = req.query

  if (!validCodes[code]) return res.status(401).json({ error: 'invalid code' })
  delete validCodes[code]

  const token = nanoid()
  validTokens[token] = true

  res.json({
    access_token: token,
    scope: 'mock_scope',
    token_type: 'mock',
  })
})

app.get('/user', async (req, res) => {
  const auth = req.get('authorization')
  if (!auth) return res.status(401).json({ error: 'no authorization header' })
  const [, token] = auth.match(/^token (.+$)/)
  if (!validTokens[token])
    return res.status(401).json({ error: 'invalid token' })

  const elevenYearsAgo = +new Date() - 11 * 365 * 24 * 60 * 60 * 1000
  res.json({
    id: `${token}-id`,
    created_at: elevenYearsAgo,
  })
})

const port = await getPort()
await new Promise((r) => app.listen(port, r))

export default port
