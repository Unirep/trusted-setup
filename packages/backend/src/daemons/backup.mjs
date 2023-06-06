import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { circuits, contribpath, normalize } from '../config.mjs'
import randomf from 'randomf'
import fs from 'fs/promises'
import path from 'path'

// backup historical zkeys to s3/r2/etc

export default class Backup {
  constructor(db) {
    this.db = db
    if (!process.env.R2_ACCOUNT_ID) {
      throw new Error('No R2 account id specified')
    }
    if (!process.env.R2_ACCESS_KEY_ID) {
      throw new Error('No R2 access key specified')
    }
    if (!process.env.R2_SECRET_ACCESS_KEY) {
      throw new Error('No R2 secret access key specified')
    }
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })

    this.bucketName = process.env.R2_BUCKET_NAME ?? 'test-unirep-ceremony'
  }

  async start() {
    const id = randomf(2n ** 256n).toString()
    this.id = id

    for (;;) {
      try {
        await this._backup(id)
      } catch (err) {
        console.log('Backup error')
        console.log(err)
      }
      if (this.id !== id) return
      await new Promise((r) => setTimeout(r, 60000))
    }
  }

  async _backup(id) {
    if (id !== this.id) return
    for (const circuit of circuits) {
      const latest = await this.db.findOne('Contribution', {
        where: {
          circuitName: circuit.name,
        },
        orderBy: {
          index: 'desc',
        },
      })
      if (!latest) continue
      const toUpload = await this.db.findMany('Contribution', {
        where: {
          circuitName: circuit.name,
          _id: { ne: latest._id },
          uploadedAt: null,
        },
      })
      for (const contribution of toUpload) {
        if (this.id !== id) return
        const filepath = path.join(
          contribpath(circuit.name),
          `${contribution.index}.zkey`
        )
        const file = await fs.open(filepath)
        const name = `${normalize(circuit.name)}_${contribution.index}.zkey`
        console.log(`Uploading ${name}`)
        const req = new PutObjectCommand({
          Body: file.createReadStream(),
          Bucket: this.bucketName,
          Key: name,
        })
        await this.s3.send(req)
        await this.db.update('Contribution', {
          where: {
            _id: contribution._id,
          },
          update: {
            uploadedAt: +new Date(),
          },
        })
        await fs.unlink(filepath)
      }
    }
  }

  stop() {
    this.id = null
  }
}
