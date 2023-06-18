import test from 'ava'
import './server.mjs'
import Ceremony from './ceremony.mjs'

test('should join queue', async (t) => {
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()

  await ceremony.client.send('ceremony.join', {
    token: ceremony.authToken,
    queueName: 'open',
  })
  const { data } = await ceremony.client.send('user.info', {
    token: ceremony.authToken,
  })
  t.is(data.inQueue, true)
})

test('should fail to join oauth queue without oauth', async (t) => {
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()

  try {
    await ceremony.client.send('ceremony.join', {
      token: ceremony.authToken,
      queueName: 'github-1-year',
    })
    t.fail()
  } catch (err) {
    t.is(err.payload.status, 1)
    t.is(err.payload.message, 'oauth requirement not met')
  }
})

test('should join queue many times', async (t) => {
  const iterations = 20
  const ceremonies = []
  for (let x = 0; x < iterations; x++) {
    const ceremony = new Ceremony()
    ceremonies.push(ceremony)
    await ceremony.connect()
    await ceremony.auth()

    await ceremony.client.send('ceremony.join', {
      token: ceremony.authToken,
      queueName: 'open',
    })
    const { data } = await ceremony.client.send('user.info', {
      token: ceremony.authToken,
    })
    t.is(data.inQueue, true)
  }
  await new Promise((r) =>
    setTimeout(r, +process.env.KEEPALIVE_INTERVAL + +process.env.PRUNE_INTERVAL)
  )
  for (let x = 0; x < iterations; x++) {
    const ceremony = ceremonies[x]
    const { data } = await ceremony.client.send('user.info', {
      token: ceremony.authToken,
    })
    t.is(data.inQueue, false)
  }
})
