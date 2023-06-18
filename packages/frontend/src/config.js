const prod = NODE_ENV === 'production'

export const SERVER = prod
  ? 'https://dev2.http.ceremony.unirep.io'
  : 'http://localhost:8000'
export const WS_SERVER = prod
  ? 'wss://dev2.ws.ceremony.unirep.io'
  : 'ws://localhost:8001'
