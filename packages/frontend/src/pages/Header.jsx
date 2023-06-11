import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './header.css'
import state from '../contexts/state'

export default observer(() => {
  const { ceremony } = React.useContext(state)
  return (
    <>
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
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
