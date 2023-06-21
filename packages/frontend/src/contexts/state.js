import { createContext } from 'react'
import { configure } from 'mobx'
import Interface from './interface'
import Ceremony from './Ceremony'
configure({
  enforceActions: 'never',
})

export const buildState = (requestUrl) => {
  const state = {}

  const ui = new Interface(state, requestUrl)
  const ceremony = new Ceremony(state, requestUrl)

  Object.assign(state, {
    ui,
    ceremony,
  })
  state.loadPromise = Promise.all([ui.loadPromise, ceremony.loadPromise])
  return state
}

export default createContext(buildState())
