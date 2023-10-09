import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import ServerState from './ServerState'
import './menu.css'
import state from '../contexts/state'

export default observer(({ closeMenu }) => {
  const { ceremony } = useContext(state)
  return (
    <div className="menu-container">
      <div className="header">
        <div style={{ marginTop: '2.5rem' }}>
          <ServerState shrink={true} />
        </div>

        <div style={{ paddingTop: '1rem' }}>
          <Link to="/">
            <img
              src={require('../../public/logo_header.svg')}
              alt="unirep ceremony logo"
            />
          </Link>
        </div>

        <img
          src={require('../../public/menu_close.svg')}
          alt="close menu icon"
          onClick={closeMenu}
        />
      </div>

      <div className="menu-content">
        <Link to="/stats">Stats</Link>

        <div className="menu-contribute">
          <Link to="/contribute">Contribute</Link>
        </div>

        <ServerState shrink={true} />

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
    </div>
  )
})
