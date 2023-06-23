import {
  getAssetFromKV,
  serveSinglePageApp,
} from '@cloudflare/kv-asset-handler'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import Routes from './src/Routes'
import state, { buildState } from './src/contexts/state'

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
  try {
    const url = new URL(event.request.url)
    const isSSR = !/.+\.[a-zA-Z]+$/.test(url.pathname)

    if (!isSSR) {
      // return a static asset
      return getAssetFromKV(event, { mapRequestToAsset: serveSinglePageApp })
    }
    // ssr the webapp page
    return ssr(event)
  } catch (e) {
    const pathname = new URL(event.request.url).pathname
    return new Response(`"${pathname}" not found`, {
      status: 404,
      statusText: 'not found',
    })
  }
}

async function ssr(event) {
  const url = new URL(event.request.url)
  const manifest = JSON.parse(__STATIC_CONTENT_MANIFEST)
  const _state = buildState(event.request.url)
  const [indexHtml, css] = await Promise.all([
    __STATIC_CONTENT.get(manifest['index.html']),
    __STATIC_CONTENT.get(manifest['main.css']),
    _state.loadPromise,
  ])
  const CEREMONY_DATA = _state.ceremony.SSR_DATA
  const app = ReactDOMServer.renderToString(
    <state.Provider value={_state}>
      <StaticRouter location={url.pathname}>
        <Routes />
      </StaticRouter>
    </state.Provider>
  )
  const finalIndex = indexHtml
    .replace('<div id="root"></div>', `<div id="root">${app}</div>`)
    .replace('<head>', `<head><style>${css}</style>`)
    .replace(
      '<head>',
      `<head><script>window.CEREMONY_DATA=${JSON.stringify(
        CEREMONY_DATA
      )}</script>`
    )
    .replace('<link href="/main.css" rel="stylesheet">', '')
  const response = new Response(finalIndex)
  response.headers.set('content-type', 'text/html')
  return response
}
