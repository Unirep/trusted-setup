import React from 'react'
import { observer } from 'mobx-react-lite'
import state from '../contexts/state'

export default observer(() => {
  return (
    <div className="container" style={{ alignItems: 'center' }}>
      <div style={{ fontSize: '2rem' }}>✅</div>
      <div style={{ height: '1rem' }} />
      <div>You are authenticated, this window can be closed.</div>
    </div>
  )
})
