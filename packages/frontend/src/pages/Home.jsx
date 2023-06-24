import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './home.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import ContributionTable from '../components/ContributionTable'
import Header from './Header'
import Welcome from './Welcome'

import state from '../contexts/state'

export default observer(() => {
  const [name, setName] = React.useState('')
  const { ui, ceremony } = React.useContext(state)
  if (!ceremony.HTTP_SERVER) {
    return <Welcome />
  }

  return (
    <>
      <Header />
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
            {ceremony.bootstrapData?.ceremonyDescription ? (
              <div
                style={{
                  maxWidth: '300px',
                  border: '1px solid black',
                  padding: '4px',
                  marginBottom: '8px',
                }}
              >
                {ceremony.bootstrapData?.ceremonyDescription}
              </div>
            ) : null}
            {ceremony.loadingInitial ? <div>Loading...</div> : null}
            {!ceremony.inQueue &&
            !ceremony.loadingInitial &&
            !ceremony.contributionHashes ? (
              <div>
                <div style={{ marginBottom: '8px' }}>
                  Join the ceremony by choosing a way to authenticate.
                </div>
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
                <div style={{ display: 'flex' }}>
                  {ceremony.bootstrapData?.authOptions?.map((option) => (
                    <Button
                      style={{ marginRight: '2px' }}
                      key={option.name}
                      onClick={async () => {
                        if (option.type === 'none') {
                          await ceremony.join(name, 'open')
                        } else {
                          await ceremony.oauth(name, option.path)
                        }
                      }}
                    >
                      {option.displayName}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
            {!ceremony.isActive && ceremony.inQueue ? (
              <div>
                <div>Ceremony</div>
                <div style={{ height: '4px' }} />
                <div>
                  You are currently number {ceremony.queuePosition} in the
                  queue, please wait until your turn.
                </div>
                <div style={{ height: '4px' }} />
                <div>
                  > This tab <strong>must</strong> remain active for you to stay
                  in the queue!
                </div>
                <div style={{ height: '4px' }} />
                <div>
                  Try pulling this tab into it's own window. Don't minimize the
                  window.
                </div>
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
                      {ceremony.attestationUrl ? (
                        <>
                          Share this text publicly, perhaps{' '}
                          <a href={ceremony.attestationUrl} target="_blank">
                            here
                          </a>
                        </>
                      ) : (
                        'Share this text publicly'
                      )}
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
              <div
                key={c.name}
                style={{ display: 'flex', marginBottom: '2px' }}
              >
                <div>
                  <strong>{c.name}</strong>: {c.contributionCount} contributions
                </div>
                <div style={{ flex: 1 }} />
                <a
                  href={new URL(
                    `/contribution/${c.name}/latest`,
                    ceremony.HTTP_SERVER
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
              <a
                href={new URL('/transcript', ceremony.HTTP_SERVER).toString()}
                target="_blank"
              >
                Full transcript
              </a>
              <div style={{ height: '4px' }} />
              {ceremony.attestationUrl ? (
                <a href={ceremony.attestationUrl} target="_blank">
                  Public attestations
                </a>
              ) : null}
            </div>
          </div>
        </div>
        <ContributionTable />
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
    </>
  )
})
