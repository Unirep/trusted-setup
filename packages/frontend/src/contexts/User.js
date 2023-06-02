import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'

export default class User {
  constructor() {
    makeAutoObservable(this)
    this.load()
  }

  async load() {}
}
