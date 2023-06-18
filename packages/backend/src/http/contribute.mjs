import {
  dbpath,
  circuits,
  contribpath,
  KEEPALIVE_INTERVAL,
} from '../config.mjs'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import zkeyManager from '../daemons/verifyParallel.mjs'

const uploadsPath = dbpath('uploads')
const upload = multer({
  dest: uploadsPath,
  limits: {
    fieldSize: 30 * 1024 * 1024,
  },
})

export default ({ app, wsApp, db, ceremony }) => {
  app.post('/contribution', upload.single('contribution'), async (req, res) => {
    try {
      const { token, circuitName } = req.body
      if (!token) return res.status(401).json({ error: 'No token' })
      const auth = await db.findOne('Auth', {
        where: { token },
      })
      if (!auth) return res.status(401).json({ error: 'unauthorized' })
      const circuit = circuits.find(({ name }) => name === circuitName)
      if (!circuit) {
        await ceremony.removeFromQueue(auth.userId)
        return res.status(422).json({ error: 'invalid circuit name' })
      }

      const _currentContributor = await ceremony.activeContributor()
      if (auth.userId !== _currentContributor?.userId || !_currentContributor)
        return res.status(401).json({ error: 'unauthorized' })

      const existingContribution = await db.findOne('Contribution', {
        where: {
          circuitName,
          queueId: _currentContributor._id,
        },
      })
      if (existingContribution)
        return res.status(409).json({ error: 'duplicate contribution' })

      // everything is in order. Let's bump the user timeoutAt
      // so they don't get pruned during verification

      const timeoutAt = +new Date() + KEEPALIVE_INTERVAL
      await db.update('CeremonyQueue', {
        where: {
          _id: _currentContributor._id,
        },
        update: {
          timeoutAt,
        },
      })
      // double check current contributor to make sure they didn't get pruned
      // while the above was happening

      {
        const currentContributor = await ceremony.activeContributor()
        if (auth.userId !== currentContributor.userId)
          return res.status(401).json({ error: 'unauthorized' })
      }

      // verify the contribution we just received
      // if it fails verification remove the user from the queue

      let hash, contributionName

      try {
        // if no existing contributions verify the genesis zkey
        // otherwise verify the last contribution
        const mpcParams = await zkeyManager.verify(
          path.join(contribpath(circuitName), `0.zkey`),
          circuit.ptauPath,
          req.file.path
        )
        if (!mpcParams) {
          // remove from queue
          await ceremony.removeFromQueue(auth.userId)
          return res.status(422).json({ error: 'invalid contribution' })
        }
        // take the latest contribution hash
        const { contributionHash, name } = mpcParams.contributions.pop()
        contributionName = name
        hash = contributionHash
        if (!hash) {
          await ceremony.removeFromQueue(auth.userId)
          return res
            .status(422)
            .json({ error: 'failed to extract contribution hash' })
        }
        // and check the second to last contribution to make sure
        // it's what we expect
        const lastHash = mpcParams.contributions.pop()?.contributionHash

        const contributionCount = await db.count('Contribution', {
          circuitName,
        })
        const latestContribution = await db.findOne('Contribution', {
          where: {
            circuitName,
          },
          orderBy: {
            index: 'desc',
          },
        })
        if (contributionCount > 0 && lastHash !== latestContribution.hash) {
          await ceremony.removeFromQueue(auth.userId)
          return res
            .status(422)
            .json({ error: 'invalid previous contribution' })
        }
      } catch (_err) {
        console.log(`Error verifying contribution`)
        console.log(_err)
        await ceremony.removeFromQueue(auth.userId)
        return res.status(422).json({ error: 'error verifying contribution' })
      }

      await db.transaction(async (_db) => {
        // check that we are the current contributor a final time
        // to make sure we didn't get pruned during verification
        const currentContributor = await ceremony.activeContributor()
        if (auth.userId !== currentContributor?.userId)
          return res.status(401).json({ error: 'pruned' })
        const queueContributionCount = await db.count('Contribution', {
          queueId: currentContributor._id,
        })
        const contributionCount = await db.count('Contribution', {
          circuitName,
        })
        if (queueContributionCount + 1 === circuits.length) {
          // the user has finished
          _db.update('CeremonyQueue', {
            where: {
              _id: currentContributor._id,
            },
            update: {
              completedAt: +new Date(),
            },
          })
        }
        _db.create('Contribution', {
          circuitName,
          index: contributionCount + 1,
          queueId: currentContributor._id,
          userId: auth.userId,
          hash,
          name: contributionName,
        })
        await fs.rename(
          req.file.path,
          path.join(contribpath(circuitName), `${contributionCount + 1}.zkey`)
        )
      })
      res.status(204).end()

      // wsApp.broadcast('activeContributor', {
      //   activeContributor: await ceremony.activeContributor(),
      //   queueLength: await ceremony.queueLength(),
      // })
      // do it async
      ceremony.sendState().catch(console.log)
    } catch (err) {
      console.log(err)
      res.status(500).end(err)
    }
  })
}
