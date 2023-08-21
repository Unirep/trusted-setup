import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './header.css'

import state from '../contexts/state'

export default observer(() => {
  const { ui, ceremony } = React.useContext(state)
  return (
    <>
      {!ui.isMobile ? (
        <div className="header">
          <div className="header-flex">
            <img
              src={require('../../public/sparkles.svg')}
              alt="blue sparkles"
            />
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
            <Link to="/stats">Stats</Link>
            <div className="header-button">
              <Link to="/contribute">Contribute</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="header">
          <div style={{ paddingTop: '1rem' }}>
            <Link to="/">
              <img
                src={require('../../public/logo_header.svg')}
                alt="unirep ceremony logo"
              />
            </Link>
          </div>

          <div>
            <div className="right-align">
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
                    {ceremony.queueLength} waiting
                  </span>
                ) : null}
              </div>
            </div>
            <div className="link right-align">
              <Link to="/contribute">Contribute</Link>
            </div>
            <div className="link right-align">
              <Link to="/stats">Stats</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
})
