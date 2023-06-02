import { nanoid } from 'nanoid'

export default [
  {
    name: 'Contribution',
    primaryKey: '_id',
    rows: [
      ['index', 'Int', { unique: true }],
      ['verified', 'Int'],
    ],
  },
  {
    name: 'CeremonyQueue',
    primaryKey: '_id',
    rows: [
      {
        name: '_id',
        type: 'String',
        default: () => nanoid(),
      },
      ['token', 'String'],
      ['index', 'Int', { unique: true }],
      ['startedAt', 'Int', { optional: true }],
      ['completedAt', 'Int', { optional: true }],
    ],
  },
  {
    name: 'Auth',
    primaryKey: 'token',
    rows: [
      {
        name: '_id',
        type: 'String',
        default: () => nanoid(),
      },
      {
        name: 'token',
        type: 'String',
        default: () => nanoid(),
      },
      {
        name: 'createdAt',
        type: 'Int',
        default: () => +new Date(),
      },
    ],
  },
]
