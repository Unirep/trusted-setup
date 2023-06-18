import test from 'ava'
import getPort from 'get-port'

process.env.WS_PORT = await getPort()
process.env.HTTP_PORT = await getPort()
process.env.KEEPALIVE_INTERVAL = 2 * 1000
process.env.PRUNE_INTERVAL = 1000
process.env.WS_SERVER = `ws://127.0.0.1:${process.env.WS_PORT}`

import EspecialClient from 'especial/client.js'
import randomf from 'randomf'
import Ceremony from './ceremony.mjs'

await import('../src/index.mjs')

test('should stay in queue', async (t) => {
  t.timeout(+process.env.KEEPALIVE_INTERVAL * 20 + 5000)
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()

  // join the open queue
  await ceremony.join('', 'open')
  ceremony.stopKeepalive()
  for (let x = 0; x < 20; x++) {
    await ceremony.client.send('ceremony.keepalive', {
      token: ceremony.authToken,
    })
    await new Promise((r) =>
      setTimeout(r, +process.env.KEEPALIVE_INTERVAL - 100)
    )
  }
  const { data } = await ceremony.client.send('user.info', {
    token: ceremony.authToken,
  })
  t.is(data.inQueue, true)
})

test('should be removed from queue without keepalive', async (t) => {
  t.timeout(+process.env.KEEPALIVE_INTERVAL * 5)
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()

  // join the open queue
  await ceremony.join('', 'open')
  ceremony.stopKeepalive()
  for (let x = 0; x < 4; x++) {
    await ceremony.client.send('ceremony.keepalive', {
      token: ceremony.authToken,
    })
    await new Promise((r) =>
      setTimeout(r, +process.env.KEEPALIVE_INTERVAL - 100)
    )
  }
  {
    const { data } = await ceremony.client.send('user.info', {
      token: ceremony.authToken,
    })
    t.is(data.inQueue, true)
  }
  await new Promise((r) => setTimeout(r, +process.env.PRUNE_INTERVAL))
  {
    const { data } = await ceremony.client.send('user.info', {
      token: ceremony.authToken,
    })
    t.is(data.inQueue, false)
  }
})
