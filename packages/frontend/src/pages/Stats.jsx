import React from 'react'
import { observer } from 'mobx-react-lite'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'

import state from '../contexts/state'

export default observer(() => {
  return (
    <>
      <Header />
      <Footer />
    </>
  )
})
