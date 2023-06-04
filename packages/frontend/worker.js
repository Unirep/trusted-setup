import {
  getAssetFromKV,
  serveSinglePageApp,
} from '@cloudflare/kv-asset-handler'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Home from './src/pages/Home'
import Header from './src/pages/Header'
import state, { buildState } from './src/contexts/state'
import { SERVER } from './src/config'

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
  try {
    const isSSR = !/.+\.[a-zA-Z]+$/.test(event.request.url)

    if (!isSSR) {
      // return a static asset
      return getAssetFromKV(event, { mapRequestToAsset: serveSinglePageApp })
    }
    // ssr the webapp page
    return ssr()
  } catch (e) {
    const pathname = new URL(event.request.url).pathname
    return new Response(`"${pathname}" not found`, {
      status: 404,
      statusText: 'not found',
    })
  }
}

async function ssr() {
  const manifest = JSON.parse(__STATIC_CONTENT_MANIFEST)
  const [indexHtml, css, ceremonyState] = await Promise.all([
    __STATIC_CONTENT.get(manifest['index.html']),
    __STATIC_CONTENT.get(manifest['main.css']),
    fetch(new URL('/ceremony', SERVER).toString())
      .then((r) => r.json())
      .catch(console.log),
  ])
  const _state = buildState()
  if (ceremonyState) {
    _state.ceremony.ingestState(ceremonyState)
  }
  const app = ReactDOMServer.renderToString(
    <state.Provider value={_state}>
      <Header />
      <Home />
    </state.Provider>
  )
  const finalIndex = indexHtml
    .replace('<div id="root"></div>', `<div id="root">${app}</div>`)
    .replace('<head>', `<head><style>${css}</style>`)
    .replace(
      '<head>',
      `<head><script>window.CEREMONY_STATE='${JSON.stringify(
        ceremonyState
      )}'</script>`
    )
    .replace('<link href="/main.css" rel="stylesheet">', '')
  const response = new Response(finalIndex)
  response.headers.set('content-type', 'text/html')
  return response
}
