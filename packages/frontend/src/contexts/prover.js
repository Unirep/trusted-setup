import { KEY_SERVER } from '../config'
import Download from '../utils/download'

const cache = {}

async function loadWithCache(url) {
  if (cache[url]) return cache[url]
  const res = await fetch(url.toString())
  const p = new Download(res)
  const d = p.download()
  cache[url] = d
  return d
}

export default {
  warmKeys: async (circuitName) => {
    const wasmUrl = new URL(`${circuitName}.wasm`, KEY_SERVER)
    const zkeyUrl = new URL(`${circuitName}.zkey`, KEY_SERVER)
    await Promise.all([loadWithCache(wasmUrl), loadWithCache(zkeyUrl)])
  },
  verifyProof: async (circuitName, publicSignals, proof) => {
    const snarkjs = await import(/* webpackPrefetch: true */ 'snarkjs')
    const url = new URL(`/${circuitName}.vkey.json`, KEY_SERVER)
    const vkey = await fetch(url.toString()).then((r) => r.json())
    return snarkjs.groth16.verify(vkey, publicSignals, proof)
  },
  genProofWithCache: async (circuitName, inputs) => {
    const snarkjs = await import(/* webpackPrefetch: true */ 'snarkjs')
    const wasmUrl = new URL(`${circuitName}.wasm`, KEY_SERVER)
    const zkeyUrl = new URL(`${circuitName}.zkey`, KEY_SERVER)
    const [wasm, zkey] = await Promise.all([
      loadWithCache(wasmUrl.toString()),
      loadWithCache(zkeyUrl.toString()),
    ])
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      await inputs,
      wasm,
      zkey
    )
    return { proof, publicSignals }
  },
  genProofAndPublicSignals: async (
    circuitName,
    inputs,
    onUpdate = () => {}
  ) => {
    const snarkjs = await import(/* webpackPrefetch: true */ 'snarkjs')
    let wasmPromise, zkeyPromise
    {
      onUpdate({ state: 10, text: 'wasm download' })
      const wasmUrl = new URL(`${circuitName}.wasm`, KEY_SERVER)
      const res = await fetch(wasmUrl.toString())
      const p = new Download(res)
      p.on('progress', ({ elapsed, progress, eta }) => {
        onUpdate({ state: 10, elapsed, progress, eta })
      })
      wasmPromise = p.download()
      wasmPromise.then(() => onUpdate({ state: 10, done: true }))
    }
    {
      onUpdate({ state: 20, text: 'zkey download' })
      const zkeyUrl = new URL(`${circuitName}.zkey`, KEY_SERVER)
      const res = await fetch(zkeyUrl.toString())
      const p = new Download(res)
      p.on('progress', ({ elapsed, progress, eta }) => {
        onUpdate({ state: 20, elapsed, progress, eta })
      })
      zkeyPromise = p.download()
      zkeyPromise.then(() => onUpdate({ state: 20, done: true }))
    }
    const [wasm, zkey] = await Promise.all([wasmPromise, zkeyPromise])
    const i = await inputs
    onUpdate({ state: 30, text: 'building proof', progress: 'wait' })
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      i,
      wasm,
      zkey
    )
    onUpdate({
      state: 40,
      done: true,
    })
    onUpdate({
      state: 100,
      text: 'complete',
    })
    return { proof, publicSignals }
  },
}
