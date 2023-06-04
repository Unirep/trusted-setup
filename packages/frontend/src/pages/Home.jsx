import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './home.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import { SERVER } from '../config'

import state from '../contexts/state'

export default observer(() => {
  const [name, setName] = React.useState('')
  const { ui, ceremony } = React.useContext(state)

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid black',
          paddingTop: '4px',
          flexWrap: 'wrap',
        }}
      >
        {!ceremony.inQueue ? (
          <div>
            <div>Join ceremony</div>
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                placeholder="contributor name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div style={{ width: '4px' }} />
              <Tooltip text="This name will be permanently associated with this contribution. Choose anything you like, it doesn't have to be unique." />
            </div>
            <div style={{ height: '4px' }} />
            <Button onClick={() => ceremony.join(name)}>Join!</Button>
          </div>
        ) : null}
        {!ceremony.isActive && ceremony.inQueue ? (
          <div>
            <div>Ceremony</div>
            <div>You are in the queue, please wait until your turn.</div>
          </div>
        ) : null}
        {ceremony.isActive && ceremony.inQueue ? (
          <div>
            <div>It's your turn!</div>
            <div>Please wait while your machine makes contributions.</div>
          </div>
        ) : null}
        <div>
          <div>Ceremony stats</div>
          <div style={{ height: '4px' }} />
          {ceremony.ceremonyState.circuitStats?.map((c) => (
            <div key={c.name}>
              <strong>{c.name}</strong>: {c.contributionCount} contributions
            </div>
          ))}
          <div style={{ height: '4px' }} />
          <div>
            <a href={new URL('/transcript', SERVER).toString()} target="_blank">
              Full transcript
            </a>
          </div>
        </div>
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
