const BN = require('bn.js')
const elliptic = require('elliptic')
const ec = new elliptic.ec('secp256k1')

export const STRIDE = 8n
export const NUM_STRIDES = 256n / STRIDE // = 32
export const REGISTERS = 4n

export const SECP256K1_N = new BN(
  'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
  16
)

export const addHexPrefix = (str) => `0x${str.replace('0x', '')}`

export const splitToRegisters = (value) => {
  const registers = []

  if (!value) {
    return [0n, 0n, 0n, 0n]
  }

  const hex = value.toString(16).replace('0x', '').padStart(64, '0')
  for (let k = 0; k < REGISTERS; k++) {
    // 64bit = 16 chars in hex
    const val = hex.slice(k * 16, (k + 1) * 16)

    registers.unshift(BigInt(addHexPrefix(val)))
  }

  return registers.map((el) => el.toString())
}

export const registersToHex = (registers) => {
  return registers
    .map((el) => BigInt(el).toString(16).padStart(16, '0'))
    .join('')
}

export const getPointPreComputes = async (point, onProgress = () => {}) => {
  const keyPoint = ec.keyFromPublic({
    x: Buffer.from(point.x.toString(16), 'hex'),
    y: Buffer.from(point.y.toString(16), 'hex'),
  })

  const total = NUM_STRIDES * 2n ** STRIDE
  let done = 0
  const gPowers = [] // [32][256][2][4]
  for (let i = 0n; i < NUM_STRIDES; i++) {
    const stride = []
    const power = 2n ** (i * STRIDE)
    for (let j = 0n; j < 2n ** STRIDE; j++) {
      const l = j * power

      const gPower = keyPoint.getPublic().mul(new BN(l))

      const x = splitToRegisters(gPower.x)
      const y = splitToRegisters(gPower.y)

      stride.push([x, y])
      if (j % 20n === 0n) {
        onProgress(Math.floor(100000 * (done / Number(total))) / 1000)
        await new Promise((r) => setTimeout(r, 1))
      }
      done++
    }
    gPowers.push(stride)
  }

  return gPowers
}
