import React from 'react'
import state from '../contexts/state'
import { observer } from 'mobx-react-lite'

export default observer(() => {
  const { ceremony, ui } = React.useContext(state)

  return (
    <div className="header-flex">
      {!ui.isMobile && (
        <img
          src={require(`../../public/sparkles${
            ceremony.connected ? '' : '_red'
          }.svg`)}
          alt="sparkles"
        />
      )}
      <div>
        <div className="header-text">
          Server:{' '}
          <span style={{ fontWeight: 600 }}>
            {ceremony.connected ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="header-text">
          Queue:{' '}
          {ceremony.connected ? (
            <span style={{ fontWeight: 600 }}>
              {ceremony.queueLength} people waiting
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
})
