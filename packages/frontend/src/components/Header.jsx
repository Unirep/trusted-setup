import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import ServerState from './ServerState'
import './header.css'

import state from '../contexts/state'

export default observer(({ logoOnly }) => {
  const { ui } = React.useContext(state)
  const [showDropdown, setShowDropdown] = useState(false)

  const toggleDropdown = () => {
    if (showDropdown) {
      setShowDropdown(false)
    } else {
      setShowDropdown(true)
    }
  }

  return (
    <>
      {logoOnly && (
        <div
          className="header"
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ textAlign: 'center' }}>
            <Link to="/">
              <img
                src={require('../../public/logo_header.svg')}
                alt="unirep ceremony logo"
              />
            </Link>
          </div>
        </div>
      )}
      {!logoOnly && !ui.isMobile && (
        <div className="header">
          <ServerState />

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
      )}{' '}
      {!logoOnly && ui.isMobile && (
        <div className="header">
          <ServerState />

          <div style={{ paddingTop: '1rem' }}>
            <Link to="/">
              <img
                src={require('../../public/logo_header.svg')}
                alt="unirep ceremony logo"
              />
            </Link>
          </div>

          <div className="menu" onClick={toggleDropdown}>
            <img src={require('../../public/menu.svg')} alt="menu icon" />
            {showDropdown ? (
              <div className="drop">
                <div className="link right-align">
                  <Link to="/stats">Stats</Link>
                </div>
                <div className="link right-align">
                  <Link to="/contribute">Contribute</Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  )
})
