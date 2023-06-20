import EspecialClient from 'especial/client.js'
import chalk from 'chalk'
import Ceremony from './ceremony.mjs'
import inquirer from 'inquirer'
import ora from 'ora'
import { HTTP_SERVER } from './config.mjs'
import fetch from 'node-fetch'

console.log('Welcome to the unirep trusted setup CLI')
const { name, entropy, authType } = await inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'Enter a public name for the contribution',
    default: 'anonymous cli contributor',
    // validate:
  },
  {
    type: 'input',
    name: 'entropy',
    message: 'Enter any extra random data (may be blank)',
  },
  {
    type: 'list',
    name: 'authType',
    message: 'How would you like to auth',
    choices: ['none', 'github'],
  },
])

const ceremony = new Ceremony()

console.log('Connecting to ceremony...')
await ceremony.connect()

console.log('Authenticating...')
await ceremony.auth()

if (authType === 'github') {
  {
    const url = new URL('/oauth/github/device', HTTP_SERVER)
    url.searchParams.append('token', ceremony.authToken)
    const data = await fetch(url.toString()).then((r) => r.json())

    console.log(
      `To auth with github enter this code: ${chalk.bold(data.userCode)}`
    )
    console.log(`At the following url: ${chalk.bold(data.verificationUri)}`)
  }
  const spinner = ora().start()
  spinner.text = 'Waiting for Github auth...'
  for (;;) {
    await new Promise((r) => setTimeout(r, 2000))
    const url = new URL('/oauth/github/list', HTTP_SERVER)
    url.searchParams.append('token', ceremony.authToken)
    const data = await fetch(url.toString()).then((r) => r.json())
    if (data.length) break
  }
  spinner.stop()
}

const { data } = await ceremony.client.send('user.info', {
  token: ceremony.authToken,
})
const queue = data.validQueues.pop()

console.log(`Joining queue ${chalk.bold(queue)}...`)
await ceremony.join(name, queue)

const spinner = ora().start()

for (;;) {
  if (ceremony.isActive) break
  // otherwise update our current queue position
  const { data } = await ceremony.client.send('user.info', {
    token: ceremony.authToken,
  })
  spinner.text = `You are number ${
    1 + data.queueEntry?.index - data.activeContributor?.index
  } in the queue`
  await new Promise((r) => setTimeout(r, 5000))
}

spinner.text = 'Calculating contribution'
const hashes = await ceremony.contribute()

spinner.stop()

console.log('Thank you for contributing! Your hashes are below.')

console.log(hashes)

process.exit(0)
