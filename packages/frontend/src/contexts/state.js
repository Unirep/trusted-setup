import { createContext } from 'react'
import Interface from './interface'
import User from './User'
import Message from './Message'

const state = {}

const ui = new Interface(state)
const user = new User(state)
const msg = new Message(state)

Object.assign(state, {
  ui,
  user,
  msg,
})

export default createContext(state)
