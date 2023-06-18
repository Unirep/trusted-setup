import getPort from 'get-port'

process.env.WS_PORT = await getPort()
process.env.HTTP_PORT = await getPort()
process.env.KEEPALIVE_INTERVAL = 2 * 1000
process.env.PRUNE_INTERVAL = 1000
process.env.WS_SERVER = `ws://127.0.0.1:${process.env.WS_PORT}`
process.env.HTTP_SERVER = `http://127.0.0.1:${process.env.HTTP_PORT}`

await import('../src/index.mjs')
