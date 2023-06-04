import { createContext } from 'react'
import { configure } from 'mobx'
import Interface from './interface'
import Ceremony from './Ceremony'
configure({
  enforceActions: 'never',
})

const state = {}

const ui = new Interface(state)
const ceremony = new Ceremony(state)

Object.assign(state, {
  ui,
  ceremony,
})

export default createContext(state)
