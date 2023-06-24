import React from 'react'
import { observer } from 'mobx-react-lite'
import state from '../contexts/state'

export default observer(() => {
  const { ui } = React.useContext(state)
  return (
    <div className="container" style={{ alignItems: 'center' }}>
      {!ui.url.searchParams.get('error') ? (
        <>
          <div style={{ fontSize: '2rem' }}>✅</div>
          <div style={{ height: '1rem' }} />
          <div>You are authenticated, this window can be closed.</div>
        </>
      ) : null}
      {!!ui.url.searchParams.get('error') ? (
        <>
          <div style={{ fontSize: '2rem' }}>❌</div>
          <div style={{ height: '1rem' }} />
          <div>
            Authentication failed:{' '}
            <strong>{ui.url.searchParams.get('error')}</strong>
          </div>
        </>
      ) : null}
    </div>
  )
})
