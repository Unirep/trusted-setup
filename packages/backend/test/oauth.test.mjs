import test from 'ava'
import './server.mjs'
import Ceremony from './ceremony.mjs'
import fetch from 'node-fetch'

test('should oauth', async (t) => {
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()

  const url = new URL(`http://127.0.0.1:${process.env.HTTP_PORT}/oauth/github`)
  url.searchParams.append('token', ceremony.authToken)
  const r = await fetch(url.toString())
  t.is(r.status, 204)
})
