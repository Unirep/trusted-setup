import {
  WS_SERVER,
  queues,
  authOptions,
  WELCOME_MESSAGE,
  CEREMONY_IMAGE_PATH,
  ATTESTATION_URL,
} from '../config.mjs'

export default ({ app }) => {
  app.get('/bootstrap', (req, res) => {
    res.json({
      WS_SERVER,
      queues,
      authOptions,
      welcomeMessage: WELCOME_MESSAGE,
      ceremonyImagePath: CEREMONY_IMAGE_PATH,
      attestationUrl: ATTESTATION_URL,
    })
  })
}
