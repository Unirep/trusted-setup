import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './home.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import { SERVER } from '../config'

import state from '../contexts/state'

export default observer(() => {
  const [username, setUsername] = React.useState('')
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
            {/*<input type="text" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />*/}
            <div style={{ height: '4px' }} />
            <Button onClick={() => ceremony.join()}>Join!</Button>
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
