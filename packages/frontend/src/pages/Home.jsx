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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
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
              <div>
                {ceremony.contributionUpdates.map((text, i) => (
                  <div key={i} style={{ fontSize: '10px' }}>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {ceremony.contributionHashes ? (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex' }}>
                <div>
                  <div>
                    <strong>Thank you for contributing!</strong>
                  </div>
                  <div>
                    Share this text publicly, perhaps{' '}
                    <a
                      href="https://github.com/Unirep/trusted-setup/issues/1"
                      target="_blank"
                    >
                      here
                    </a>
                    ?
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '4px' }} />
                <Button
                  onClick={async () => {
                    navigator.clipboard.writeText(ceremony.contributionText)
                    await new Promise((r) => setTimeout(r, 1000))
                  }}
                  loadingText="Copied!"
                >
                  Copy
                </Button>
              </div>
              <div style={{ maxWidth: '400px', overflow: 'scroll' }}>
                <code>{ceremony.contributionText}</code>
              </div>
            </div>
          ) : null}
        </div>
        <div style={{ marginTop: ui.isMobile ? '8px' : null }}>
          <div>Ceremony stats</div>
          <div style={{ height: '4px' }} />
          {ceremony.ceremonyState.circuitStats?.map((c) => (
            <div key={c.name} style={{ display: 'flex', marginBottom: '2px' }}>
              <div>
                <strong>{c.name}</strong>: {c.contributionCount} contributions
              </div>
              <div style={{ flex: 1 }} />
              <a
                href={new URL(
                  `/contribution/${c.name}/latest`,
                  SERVER
                ).toString()}
              >
                <img
                  style={{ width: '16px', height: '16px' }}
                  src={require('../../public/download-arrow.png')}
                  width={16}
                />
              </a>
            </div>
          ))}
          <div style={{ height: '4px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <a href={new URL('/transcript', SERVER).toString()} target="_blank">
              Full transcript
            </a>
            <div style={{ height: '4px' }} />
            <a
              href="https://github.com/unirep/trusted-setup/issues/1"
              target="_blank"
            >
              Public attestations
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
