import { ethers } from 'ethers'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import _config from '../../../config.js'
import { config } from 'dotenv'
config()

const DB_PATH =
  process.env.DB_PATH ||
  (await fs.mkdtemp(path.join(os.tmpdir(), 'trusted-ceremony')))
const stat = await fs.stat(DB_PATH)
if (!stat.isDirectory()) {
  throw new Error('DB_PATH is not a directory')
}
export const dbpath = (name) => path.join(DB_PATH, name)
