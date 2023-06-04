import { ethers } from 'ethers'

const prod = NODE_ENV === 'production'

export const SERVER = prod ? 'https://http.ceremony.unirep.io' : 'http://localhost:8000'
export const WS_SERVER = prod
  ? 'wss://ws.ceremony.unirep.io'
  : 'ws://localhost:8001'
