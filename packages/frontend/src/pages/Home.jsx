import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './home.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import { SERVER } from '../config'

import state from '../contexts/state'

export default observer(() => {
  const { ui, user } = React.useContext(state)

  return (
    <div className="container">
      <div style={{ padding: '4px', border: '1px solid black' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        ></div>
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          alignSelf: 'center',
          display: 'flex',
          padding: '8px',
          alignItems: 'center',
        }}
      >
        <a href="https://appliedzkp.org" target="_blank">
          <img
            src={require('../../public/pse_logo.svg')}
            width="25px"
            style={{ cursor: 'pointer' }}
          />
        </a>
      </div>
    </div>
  )
})
