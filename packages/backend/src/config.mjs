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

export const KEEPALIVE_INTERVAL = 20 * 1000
export const CONTRIBUTION_TIMEOUT = 90 * 1000

// CIRCUIT CONFIG

const ptauPath = path.join(
  __dirname,
  '../circuits/powersOfTau28_hez_final_17.ptau'
)

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
