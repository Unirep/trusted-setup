import { createContext } from 'react'
import Interface from './interface'
import Ceremony from './Ceremony'

const state = {}

const ui = new Interface(state)
const ceremony = new Ceremony(state)

Object.assign(state, {
  ui,
  ceremony,
})

export default createContext(state)
