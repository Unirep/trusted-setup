export const catchError = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (err) {
    console.log('Uncaught error in http handler')
    console.log(err)
    res.status(500).end({ error: 'uncaught error' })
  }
}

export const catchErrorWs =
  (fn) =>
  async (...args) => {
    const [, send] = args
    try {
      await fn(...args)
    } catch (err) {
      console.log('Uncaught error in ws handler')
      console.log(err)
      send('uncaught error', 2)
    }
  }
