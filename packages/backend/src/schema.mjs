import { nanoid } from 'nanoid'

export default [
  {
    name: 'OAuthState',
    primaryKey: '_id',
    rows: [
      {
        name: '_id',
        type: 'String',
        default: () => nanoid(),
      },
      {
        name: 'createdAt',
        type: 'Int',
        default: () => +new Date(),
      },
      ['type', 'String'],
      ['redirectDestination', 'String'],
      ['data', 'String', { optional: true }],
      ['userId', 'String'],
    ],
  },
  {
    name: 'OAuth',
    primaryKey: '_id',
    rows: [
      // a unique identifier for the account
      ['_id', 'String'],
      ['type', 'String'],
      ['userId', 'String'],
      ['accountAgeMs', 'Int'],
    ],
  },
  {
    name: 'Contribution',
    primaryKey: '_id',
    rows: [
      {
        name: '_id',
        type: 'String',
        default: () => nanoid(),
      },
      ['index', 'Int'],
      ['circuitName', 'String'],
      ['queueId', 'String'],
      ['userId', 'String'],
      ['hash', 'String', { unique: true }],
      ['name', 'String'],
      {
        name: 'createdAt',
        type: 'Int',
        default: () => +new Date(),
      },
      ['uploadedAt', 'Int', { optional: true }],
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
      ['userId', 'String'],
      ['index', 'Int', { unique: true }],
      ['startedAt', 'Int', { optional: true }],
      ['completedAt', 'Int', { optional: true }],
      ['prunedAt', 'Int', { optional: true }],
      // the time at which they will be removed from the queue
      // if they don't send a keepalive
      ['timeoutAt', 'Int'],
      // the name of the queue the item is in
      ['name', 'String'],
    ],
  },
  {
    name: 'User',
    primaryKey: '_id',
    rows: [
      {
        name: '_id',
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
  {
    name: 'Auth',
    primaryKey: '_id',
    rows: [
      {
        name: '_id',
        type: 'String',
        default: () => nanoid(),
      },
      {
        name: 'userId',
        type: 'String',
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
