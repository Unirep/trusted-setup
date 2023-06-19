import EspecialClient from 'especial/client.js'
import chalk from 'chalk'
import Ceremony from './ceremony.mjs'
import inquirer from 'inquirer'
import ora from 'ora'

console.log('Welcome to the unirep trusted setup CLI')
const { name, entropy } = await inquirer.prompt([
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
])

const ceremony = new Ceremony()

console.log('Connecting to ceremony...')
await ceremony.connect()

console.log('Authenticating...')
await ceremony.auth()

console.log('Joining queue...')
await ceremony.join(name, 'open')

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
