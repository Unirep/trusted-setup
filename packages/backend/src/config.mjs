import { ethers } from 'ethers'
import fs from 'fs/promises'
import _fs from 'fs'
import os from 'os'
import path from 'path'
import url from 'url'
import { config } from 'dotenv'

config()

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const DB_PATH =
  process.env.DB_PATH ||
  (await fs.mkdtemp(path.join(os.tmpdir(), 'trusted-ceremony')))

try {
  const stat = await fs.stat(DB_PATH)
  if (!stat.isDirectory()) {
    throw new Error('DB_PATH is not a directory')
  }
} catch (err) {
  if (err.code !== 'ENOENT') throw err
  await fs.mkdir(DB_PATH)
}
export const dbpath = (name) => path.join(DB_PATH, name)
export const normalize = (name) => name.toLowerCase().split(' ').join('_')
export const contribpath = (name) => dbpath(normalize(name))

export const KEEPALIVE_INTERVAL = +(process.env.KEEPALIVE_INTERVAL ?? 25 * 1000)
export const CONTRIBUTION_TIMEOUT = +(
  process.env.CONTRIBUTION_TIMEOUT ?? 160 * 1000
)
export const PRUNE_INTERVAL = +(process.env.PRUNE_INTERVAL ?? 12 * 1000)

export const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID ?? 'dc1631cd0011caf33a46'
export const GITHUB_CLIENT_SECRET =
  process.env.GITHUB_CLIENT_SECRET ?? '8d24cd5eba41ec910cbd3ffd41d17062b4c5b309'
export const GITHUB_REDIRECT_URI =
  process.env.GITHUB_REDIRECT_URI ??
  'http://localhost:8000/oauth/github/callback'

export const WS_SERVER = process.env.WS_SERVER ?? `ws://127.0.0.1:8001`

// CIRCUIT CONFIG

const ptauPath = path.join(
  __dirname,
  '../circuits/powersOfTau28_hez_final_17.ptau'
)

export const authOptions = [
  {
    name: 'github',
    displayName: 'Github',
    type: 'oauth',
    path: '/oauth/github',
  },
  {
    name: 'github-device',
    displayName: 'Github',
    type: 'device-flow',
    path: '/oauth/github/device',
    listPath: '/oauth/github/list', // specific to device-flow auth
  },
  {
    name: 'none',
    displayName: 'No auth',
    type: 'none',
  },
]

export const queues = [
  {
    name: 'open',
  },
  {
    name: 'github-1-year',
    oauthRequire: {
      type: 'github',
      accountAgeMs: { gt: 365 * 24 * 60 * 60 * 1000 },
    },
  },
  {
    name: 'github-5-year',
    oauthRequire: {
      type: 'github',
      accountAgeMs: { gt: 5 * 365 * 24 * 60 * 60 * 1000 },
    },
  },
  {
    name: 'github-10-year',
    oauthRequire: {
      type: 'github',
      accountAgeMs: { gt: 10 * 365 * 24 * 60 * 60 * 1000 },
    },
  },
  {
    name: 'github-30-year',
    oauthRequire: {
      type: 'github',
      accountAgeMs: { gt: 30 * 365 * 24 * 60 * 60 * 1000 },
    },
  },
]

export const circuits = [
  {
    name: 'Sign Up',
    zkeyPath: path.join(__dirname, '../circuits/signup.zkey'),
    ptauPath,
  },
  {
    name: 'User State Transition',
    zkeyPath: path.join(__dirname, '../circuits/userStateTransition.zkey'),
    ptauPath,
  },
  {
    name: 'Epoch Key Lite',
    zkeyPath: path.join(__dirname, '../circuits/epochKeyLite.zkey'),
    ptauPath,
  },
  {
    name: 'Epoch Key',
    zkeyPath: path.join(__dirname, '../circuits/epochKey.zkey'),
    ptauPath,
  },
  {
    name: 'Prove Reputation',
    zkeyPath: path.join(__dirname, '../circuits/proveReputation.zkey'),
    ptauPath,
  },
  {
    name: 'Double Action',
    zkeyPath: path.join(__dirname, '../circuits/preventDoubleAction.zkey'),
    ptauPath,
  },
]

for (const circuit of circuits) {
  await fs.stat(circuit.zkeyPath)
  await fs.stat(circuit.ptauPath)
  try {
    await fs.mkdir(contribpath(circuit.name))
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
  const genesisZkeyPath = path.join(contribpath(circuit.name), '0.zkey')
  if (!_fs.existsSync(genesisZkeyPath)) {
    // CAREFUL, this is not atomic
    await fs.cp(circuit.zkeyPath, genesisZkeyPath)
  }
}
