import test from 'ava'
import './server.mjs'
import Ceremony from './ceremony.mjs'

test('should make contribution to ceremony', async (t) => {
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()

  await ceremony.join('', 'open')
  const keepalivePromise = ceremony.startKeepalive()
  for (;;) {
    await new Promise((r) => setTimeout(r, 1000))
    const { data } = await ceremony.client.send('user.info', {
      token: ceremony.authToken,
    })
    if (data.isActive) continue
    await ceremony.contribute()
    break
  }
  await keepalivePromise
  t.pass()
})
