import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './header.css'

import state from '../contexts/state'

export default observer(() => {
  const { ceremony } = React.useContext(state)
  return (
    <div className="header">
      <div className="header-flex">
        <img src={require('../../public/sparkles.svg')} alt="blue sparkles" />
        <div>
          <div className="header-text">
            Server:{' '}
            <span className="bold">
              {ceremony.connected ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="header-text">
            Queue:{' '}
            <span className="bold">
              {ceremony.queueLength} people are waiting
            </span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/">
          <img
            src={require('../../public/logo_header.svg')}
            alt="unirep ceremony logo"
          />
        </Link>
      </div>

      <div className="header-flex" style={{ justifyContent: 'flex-end' }}>
        <Link to="/stats">Stats</Link>
        <div className="header-button">
          <Link to="/contribute">Contribute</Link>
        </div>
      </div>
    </div>
  )
})
