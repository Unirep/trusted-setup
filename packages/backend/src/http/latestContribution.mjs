import fs from 'fs/promises'
import path from 'path'
import { dbpath, contribpath, circuits, normalize } from '../config.mjs'

export default ({ app, db, ceremony }) => {
  app.get('/contribution/:circuitName/latest', async (req, res) => {
    try {
      const { circuitName } = req.params
      const circuit = circuits.find(({ name }) => name === circuitName)
      if (!circuit) {
        return res.status(422).json({ error: 'invalid circuit name' })
      }
      const contribution = await db.findOne('Contribution', {
        where: {},
        orderBy: {
          index: 'desc',
        },
      })
      const index = contribution?.index ?? 0
      const filename = `${index}.zkey`
      res.setHeader(
        'Content-disposition',
        `attachment; filename=${normalize(circuitName)}_${index}.zkey`
      )
      const circuitDir = path.join(contribpath(circuitName))
      const file = await fs.open(path.join(circuitDir, filename))
      const stream = file.createReadStream()
      stream.pipe(res)
    } catch (err) {
      console.log(err)
      res.status(500).end(err)
    }
  })
}
