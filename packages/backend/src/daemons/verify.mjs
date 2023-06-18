import * as snarkjs from 'snarkjs'

const TIMEOUT = 40000
const args = process.argv.slice(2)

function formatHash(b) {
  if (!b) return null
  const a = new DataView(b.buffer, b.byteOffset, b.byteLength)
  let S = ''
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      S += a
        .getUint32(i * 16 + j * 4)
        .toString(16)
        .padStart(8, '0')
    }
  }
  return S
}

try {
  setTimeout(() => {
    console.log('Timed out verifying', ...args)
    process.exit(1)
  }, TIMEOUT)
  // console.log('verifying', ...args)
  const mpcParams = await snarkjs.zKey.verifyFromInit(...args)

  if (!mpcParams) {
    console.log('no mpcParams')
    process.send(mpcParams)
    process.exit(0)
  }
  process.send({
    contributions: mpcParams.contributions.map((c) => ({
      contributionHash: formatHash(c.contributionHash),
      name: c.name,
    })),
  })
  process.exit(0)
} catch (err) {
  console.log(err)
  process.exit(1)
}
