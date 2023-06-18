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
    if (data.active) break
  }
  await ceremony.contribute()
  await keepalivePromise
  t.pass()
})

test('should fail to make duplicate contribution', async (t) => {
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
    if (data.active) break
  }
  await ceremony.contribute()
  await keepalivePromise
  t.pass()
})

test('should fail to submit invalid contribution', async (t) => {
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
    if (data.active) break
  }
  ceremony.stopKeepalive()

  const badData = new Uint8Array(Array(512).fill(1))
  const r = await ceremony.uploadContribution(badData, 'User State Transition')
  t.is(r.ok, false)
  t.is(r.status, 422)

  // check that we're removed from the queue
  const { data } = await ceremony.client.send('user.info', {
    token: ceremony.authToken,
  })
  t.falsy(data.active)
  t.is(data.inQueue, false)

  await keepalivePromise
})

test('should fail to make contribution if not active', async (t) => {
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()
  const mockData = new Uint8Array(Array(512).fill(1))
  const r = await ceremony.uploadContribution(mockData, 'User State Transition')
  t.is(r.ok, false)
  t.is(r.status, 401)
})

test('should fail to make contribution with bad circuit name', async (t) => {
  const ceremony = new Ceremony()
  await ceremony.connect()
  await ceremony.auth()
  const mockData = new Uint8Array(Array(512).fill(1))
  const r = await ceremony.uploadContribution(mockData, 'Bad Circuit Name')
  t.is(r.status, 422)
})

test('should fail to make contribution with no auth', async (t) => {
  const ceremony = new Ceremony()
  const mockData = new Uint8Array(Array(512).fill(1))
  const r = await ceremony.uploadContribution(mockData, 'User State Transition')
  t.is(r.status, 401)
})

test.skip('should use multiple queues', async (t) => {})
