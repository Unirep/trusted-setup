import { WS_SERVER, queues } from '../config.mjs'

export default ({ app }) => {
  app.get('/bootstrap', (req, res) => {
    res.json({
      WS_SERVER,
      queues,
      welcomeMessage: 'Welcome to the unirep trusted setup CLI',
      authOptions: ['github', 'none'],
    })
  })
}
