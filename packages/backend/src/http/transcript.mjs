import fs from 'fs/promises'
import path from 'path'
import { dbpath, contribpath, circuits } from '../config.mjs'

export default ({ app, db, ceremony }) => {
  app.get('/contribution/:id', async (req, res) => {
    try {
      const { id } = req.params
      const { token, circuitName } = req.query
      if (!token) return res.status(401).json({ error: 'No token' })
      const auth = await db.findOne('Auth', {
        where: { token },
      })
      if (!auth) return send(1, 'unauthorized')
      const circuit = circuits.find(({ name }) => name === circuitName)
      if (!circuit) {
        return res.status(422).json({ error: 'invalid circuit name' })
      }
      const contribution = await db.findOne('Contribution', {
        where: {
          _id: id,
        },
      })
      if (!contribution && id !== 'genesis')
        return res
          .status(404)
          .json({ error: `Unable to find contribution ${id}` })
      const _circuitName = contribution?.circuitName ?? circuitName
      const filename = `${contribution?.index ?? 0}.zkey`
      const circuitDir = path.join(contribpath(_circuitName))
      const file = await fs.open(path.join(circuitDir, filename))
      const stream = file.createReadStream()
      stream.pipe(res)
    } catch (err) {
      console.log(err)
      res.status(500).end(err)
    }
  })
}
