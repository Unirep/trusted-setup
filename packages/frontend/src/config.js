const prod = NODE_ENV === 'production'

export const SERVER = prod
  ? 'https://dev.http.ceremony.unirep.io'
  : 'http://localhost:8000'
export const WS_SERVER = prod
  ? 'wss://dev.ws.ceremony.unirep.io'
  : 'ws://localhost:8001'
