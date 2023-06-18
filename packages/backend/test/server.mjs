import getPort from 'get-port'
import githubMockPort from './githubMock.mjs'

process.env.WS_PORT = await getPort()
process.env.HTTP_PORT = await getPort()
process.env.KEEPALIVE_INTERVAL = 4 * 1000
process.env.PRUNE_INTERVAL = 4 * 1000
process.env.CONTRIBUTION_TIMEOUT = 40 * 1000
process.env.WS_SERVER = `ws://127.0.0.1:${process.env.WS_PORT}`
process.env.HTTP_SERVER = `http://127.0.0.1:${process.env.HTTP_PORT}`
process.env.GITHUB_URL = `http://127.0.0.1:${githubMockPort}`
process.env.GITHUB_REDIRECT_URI = `http://127.0.0.1:${process.env.HTTP_PORT}/oauth/github/callback`

await import('../src/index.mjs')
