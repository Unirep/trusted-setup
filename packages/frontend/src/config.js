export const HTTP_SERVER = process.env.HTTP_SERVER
  ? process.env.HTTP_SERVER.startsWith('http')
    ? process.env.HTTP_SERVER
    : `https://${process.env.HTTP_SERVER}`
  : null
