import test from 'ava'
import './server.mjs'
import Ceremony from './ceremony.mjs'
import randomf from 'randomf'
import fetch from 'node-fetch'

test.serial('should use multiple queues', async (t) => {
  const _ceremony = new Ceremony()
  await _ceremony.connect()
  const { data: _data } = await _ceremony.client.send('ceremony.state')
  const queues = _data.queueLengths.slice(0, -1)

  const perQueue = 2
  const contributors = []
  const keepalivePromises = []
  // const queues = await
  for (let x = 0; x < perQueue * queues.length; x++) {
    const queueIndex = Math.floor(x / perQueue)
    // add them to the queue out of order
    const ceremony = new Ceremony()
    await ceremony.connect()
    await ceremony.auth()
    ceremony.queueIndex = queueIndex
    const url = new URL(
      `http://127.0.0.1:${process.env.HTTP_PORT}/oauth/github`
    )
    url.searchParams.append('token', ceremony.authToken)
    const r = await fetch(url.toString())
    t.is(r.status, 204)
    await ceremony.join('', queues[queueIndex].name)
    keepalivePromises.push(ceremony.startKeepalive())
    contributors.push(ceremony)
  }
  {
    const { data } = await _ceremony.client.send('ceremony.state')
    for (const queue of queues) {
      const queueLength = data.queueLengths.find((v) => v.name === queue.name)
      t.is(queueLength.count, perQueue)
    }
  }
  let activeQueueIndex = 0
  const contributionHashes = []
  for (;;) {
    // pull entries from queue in round robin and make contributions
    if (contributors.length === 0) break
    const nextContributorIndex = contributors.findIndex((c) => {
      return c.queueIndex === activeQueueIndex
    })
    if (nextContributorIndex === -1) {
      activeQueueIndex = (activeQueueIndex + 1) % queues.length
      continue
    }
    const nextContributor = contributors[nextContributorIndex]
    // check all entries in the queue
    for (let x = 0; x < contributors.length; x++) {
      if (x === nextContributorIndex) continue
      const { data } = await contributors[x].client.send('user.info', {
        token: contributors[x].authToken,
      })
      t.is(data.active, false)
      t.is(data.inQueue, true)
    }
    // remove the next contributor from the local array
    contributors.splice(nextContributorIndex, 1)
    // do the contribution
    const hashes = await nextContributor.contribute()
    contributionHashes.push(hashes)
    activeQueueIndex = (activeQueueIndex + 1) % queues.length
  }
  await Promise.all(keepalivePromises)
  // check the resulting transcript
  const url = new URL('/transcript', process.env.HTTP_SERVER)
  const transcript = await fetch(url.toString()).then((r) => r.json())
  for (let x = 1; x <= contributionHashes.length; x++) {
    const transcriptHashes = transcript.filter(({ index }) => index === x)
    const circuitNames = Object.keys(contributionHashes[x - 1])
    t.is(transcriptHashes.length, circuitNames.length)
    for (const name of circuitNames) {
      const hash = contributionHashes[x - 1][name]
      const f = transcriptHashes.findIndex(
        (h) => h.circuitName === name && h.hash === hash
      )
      t.not(f, -1)
    }
  }
})

test.serial('should fail to make invalid contribution (bad)', async (t) => {
  const snarkjs = await import('snarkjs')
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
  const latestContribution = await ceremony.downloadContribution(
    'Epoch Key Lite'
  )
  // make two contributions and submit the second one
  // the second one should be rejected because it's not
  // based on the latest ceremony contribution
  const out1 = { type: 'mem' }
  await snarkjs.zKey.contribute(
    latestContribution,
    out1,
    'anonymous contributor',
    Array(32)
      .fill(null)
      .map(() => randomf(2n ** 256n))
      .join('')
  )
  const out2 = { type: 'mem' }
  await snarkjs.zKey.contribute(
    out1,
    out2,
    'anonymous contributor',
    Array(32)
      .fill(null)
      .map(() => randomf(2n ** 256n))
      .join('')
  )
  ceremony.stopKeepalive()
  const r = await ceremony.uploadContribution(out2.data, 'Epoch Key Lite')
  t.is(r.status, 422)

  // check that we're removed from the queue
  const { data } = await ceremony.client.send('user.info', {
    token: ceremony.authToken,
  })
  t.falsy(data.active)
  t.is(data.inQueue, false)

  await keepalivePromise
})

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

test('should fail to submit invalid contribution (random)', async (t) => {
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
