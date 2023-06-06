import EspecialClient from 'especial/client.js'
import { WS_SERVER, SERVER } from './config.mjs'
import randomf from 'randomf'
import chalk from 'chalk'
import Ceremony from './ceremony.mjs'
import inquirer from 'inquirer'

//

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
await ceremony.join(name)
