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

      <div style={{ textAlign: 'center' }}>
        <Link to="/">
          <img
            src={require('../../public/logo_header.svg')}
            alt="unirep ceremony logo"
          />
        </Link>
      </div>

      <div className="header-flex" style={{ justifyContent: 'flex-end' }}>
        <Link to="/stats/?s=dev2.http.ceremony.unirep.io">Stats</Link>
        <div className="header-button">
          <Link to="/contribute/?s=dev2.http.ceremony.unirep.io">
            Contribute
          </Link>
        </div>
      </div>
    </div>
  )
})
