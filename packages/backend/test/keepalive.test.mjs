import test from 'ava'
import './server.mjs'
import Ceremony from './ceremony.mjs'

test('should stay in queue', async (t) => {
  const iterations = 20
  t.timeout(+process.env.KEEPALIVE_INTERVAL * iterations + 5000)
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()

  // join the open queue
  await ceremony.client.send('ceremony.join', {
    token: ceremony.authToken,
    queueName: 'open',
  })
  for (let x = 0; x < iterations; x++) {
    await ceremony.client.send('ceremony.keepalive', {
      token: ceremony.authToken,
    })
    await new Promise((r) =>
      setTimeout(r, +process.env.KEEPALIVE_INTERVAL - 800)
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

  await ceremony.client.send('ceremony.join', {
    token: ceremony.authToken,
    queueName: 'open',
  })
  for (let x = 0; x < 4; x++) {
    await ceremony.client.send('ceremony.keepalive', {
      token: ceremony.authToken,
    })
    await new Promise((r) =>
      setTimeout(r, +process.env.KEEPALIVE_INTERVAL - 800)
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
