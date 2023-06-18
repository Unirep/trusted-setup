import test from 'ava'
import './server.mjs'
import Ceremony from './ceremony.mjs'
import fetch from 'node-fetch'

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

test('should be removed from queue after contribution timeout', async (t) => {
  t.timeout(
    +process.env.CONTRIBUTION_TIMEOUT + process.env.PRUNE_INTERVAL + 10000
  )
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()

  // join the open queue
  await ceremony.client.send('ceremony.join', {
    token: ceremony.authToken,
    queueName: 'open',
  })
  const keepalivePromise = ceremony.startKeepalive().catch(() => {})
  for (;;) {
    const { data } = await ceremony.client.send('user.info', {
      token: ceremony.authToken,
    })
    t.is(data.inQueue, true)
    if (data.active) break
    await new Promise((r) => setTimeout(r, 1000))
  }
  await new Promise((r) =>
    setTimeout(
      r,
      +process.env.CONTRIBUTION_TIMEOUT + +process.env.PRUNE_INTERVAL
    )
  )
  const { data } = await ceremony.client.send('user.info', {
    token: ceremony.authToken,
  })
  t.is(data.inQueue, false)
  t.falsy(data.active)
  await keepalivePromise
})

test('should fail to join oauth queue without meeting requirement', async (t) => {
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()

  const url = new URL(`http://127.0.0.1:${process.env.HTTP_PORT}/oauth/github`)
  url.searchParams.append('token', ceremony.authToken)
  const r = await fetch(url.toString())
  t.is(r.status, 204)

  try {
    await ceremony.client.send('ceremony.join', {
      token: ceremony.authToken,
      queueName: 'github-30-year',
    })
    t.fail()
  } catch (err) {
    t.is(err.payload?.message, 'oauth requirement not met')
  }
  const { data } = await ceremony.client.send('user.info', {
    token: ceremony.authToken,
  })
  t.is(data.inQueue, false)
})

test('should join oauth queue', async (t) => {
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()

  const url = new URL(`http://127.0.0.1:${process.env.HTTP_PORT}/oauth/github`)
  url.searchParams.append('token', ceremony.authToken)
  const r = await fetch(url.toString())
  t.is(r.status, 204)

  {
    const { status } = await ceremony.client.send('ceremony.join', {
      token: ceremony.authToken,
      queueName: 'github-1-year',
    })
    t.is(status, 0)
  }
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
