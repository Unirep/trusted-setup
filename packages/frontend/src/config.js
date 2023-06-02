import { ethers } from 'ethers'
import config from '../../../config'

const prod = NODE_ENV === 'production'

export const SERVER = prod ? 'https://relay.zketh.io' : 'http://localhost:8000'
export const WS_SERVER = prod
  ? 'wss://relay.zketh.io/ws'
  : 'ws://localhost:8001'
