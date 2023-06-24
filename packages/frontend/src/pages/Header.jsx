import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './header.css'
import state from '../contexts/state'

export default observer(() => {
  const { ceremony, ui } = React.useContext(state)
  return (
    <>
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            style={{
              display: ceremony.imageUrl && ui.loaded ? 'block' : 'none',
              animation:
                ceremony.imageUrl && ui.loaded
                  ? '2.0s ease-in-out 0s fadeinfromleft'
                  : '',
              marginRight: '4px',
              borderRadius: '8px',
            }}
            role="img"
            src={ceremony.imageUrl}
            height="30px"
            alt="Server defined ceremony display logo"
            decoding="async"
            fetchpriority="low"
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              background: ceremony.connected ? 'green' : 'red',
              borderRadius: '10px',
            }}
          />
          <div style={{ width: '4px' }} />
          <div style={{ fontSize: '12px' }}>
            {ceremony.connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="links">Active: {ceremony.activeContributor}</div>
      </div>

      <Outlet />
    </>
  )
})
