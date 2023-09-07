import React from 'react'
import { observer } from 'mobx-react-lite'
import { Link, useLocation } from 'react-router-dom'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import state from '../contexts/state'
import './contribute.css'

const ContributeState = {
  loading: 0,
  normal: 1,
  queueing: 2,
  contributing: 3,
  finished: 4,
  offline: 5,
}

export default observer(() => {
  const [name, setName] = React.useState('')
  const { hash } = useLocation()
  const { ui, ceremony } = React.useContext(state)
  const [contributeState, setContributeState] = React.useState(
    !ceremony.connected || ceremony.loadingInitial
      ? ContributeState.loading
      : ContributeState.normal
  )

  React.useEffect(() => {
    if (!ceremony.connected) setContributeState(ContributeState.offline)
    else if (ceremony.loadingInitial)
      setContributeState(ContributeState.loading)
    else if (ceremony.inQueue) {
      if (ceremony.isActive) setContributeState(ContributeState.contributing)
      else setContributeState(ContributeState.queueing)
    } else if (ceremony.contributionHashes)
      setContributeState(ContributeState.finished)
    else setContributeState(ContributeState.normal)
  }, [
    ceremony.connected,
    ceremony.loadingInitial,
    ceremony.inQueue,
    ceremony.contributionHashes,
    ceremony.isActive,
  ])

  return (
    <>
      <div className="contribute-container">
        <div className="contribute-left">
          <Link
            to="/"
            style={{
              pointerEvents:
                contributeState === contributeState.queueing ||
                contributeState === contributeState.contributing
                  ? 'none'
                  : '',
            }}
          >
            <img
              src={require('../../public/logo_footer.svg')}
              alt="unirep ceremony logo"
            />
          </Link>

          {contributeState === ContributeState.offline && (
            <div className="contribute-main">
              <b>
                Server is offline at this moment. It's better to come back
                later.
              </b>
            </div>
          )}
          {contributeState === ContributeState.loading && (
            <div className="contribute-main">Loading...</div>
          )}
          {(contributeState === ContributeState.normal ||
            contributeState === ContributeState.offline ||
            contributeState === ContributeState.queueing ||
            contributeState === ContributeState.contributing) && (
            <div className="contribute-main">
              <div className="header-flex" style={{ margin: '2rem 0 3rem' }}>
                <img
                  src={require(`../../public/sparkles${
                    ceremony.connected ? '' : '_red'
                  }.svg`)}
                  alt="sparkles"
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
              <p>
                Beyond digital horizons, a nebulous archway glimmers - UniRep,
                the path to a realm where privacy's song fills the air.
              </p>
            </div>
          )}
          {contributeState === ContributeState.normal &&
            hash &&
            hash === '#cli' && (
              <div className="contribute-main">
                <div className="contribute-cli-field">
                  <h4>Contribute by CLI</h4>
                  <ul>
                    <li>
                      Install{' '}
                      <a
                        href="https://github.com/Unirep/trusted-setup"
                        blank="_"
                      >
                        trusted-setup package
                      </a>
                    </li>
                    <li>npx trusted-setup</li>
                    <li>Use: https://setup.unirep.io (need to update)</li>
                  </ul>
                </div>
              </div>
            )}
          {contributeState === ContributeState.normal && hash !== '#cli' && (
            <div className="contribute-main">
              <div className="contribute-field">
                <input
                  type="text"
                  placeholder="Contribute as Anon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Tooltip
                  style={{ filter: 'invert(100%)' }}
                  text="This name will be permanently associated with this contribution. Choose anything you like, it doesn't have to be unique."
                />
                <Button
                  style={{
                    borderRadius: '24px',
                    color: 'black',
                    padding: '12px 24px',
                    fontWeight: '600',
                  }}
                  onClick={async () => await ceremony.join(name, 'open')}
                >
                  start contributing
                </Button>
              </div>
              <p className="interline">
                ----------------------------------------------------------------------------------
              </p>
              <p>Or contribute with your social profiles</p>
              <div className="contribute-field">
                {ceremony.bootstrapData?.authOptions?.map((option) => {
                  if (option.type !== 'none') {
                    return (
                      <Button
                        style={{
                          borderRadius: '24px',
                          color: 'black',
                          padding: '12px 24px',
                          fontWeight: '600',
                        }}
                        key={option.name}
                        onClick={async () => {
                          if (option.type === 'none') {
                            await ceremony.join(name, 'open')
                          } else {
                            await ceremony.oauth(name, option.path)
                          }
                        }}
                      >
                        <img
                          src={require(`../../public/${option.displayName.toLowerCase()}.svg`)}
                          alt=""
                        />
                        <span>{option.displayName}</span>
                      </Button>
                    )
                  }
                })}
              </div>
            </div>
          )}
          {contributeState === ContributeState.queueing && (
            <div className="message-box">
              <p>
                <strong>Authenticated.</strong>
              </p>
              <p>
                Please hold until the portal opens, there
                {ceremony.queueLength > 1
                  ? `are ${ceremony.queueLength} people `
                  : `is ${ceremony.queueLength} person `}{' '}
                waiting ahead of you.
              </p>
              <p>You can also leave this window open and come back later.</p>
            </div>
          )}
          {contributeState === ContributeState.contributing && (
            <div className="message-box">
              <p>
                <strong>Authenticated.</strong>
              </p>
              <p>It's your turn now.</p>
              <p>Opening portal & cosmos generator...</p>
            </div>
          )}
          {contributeState === ContributeState.finished && (
            <div>
              Thank you for contributing!{' '}
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
              <Button
                onClick={async () => {
                  navigator.clipboard.writeText(ceremony.contributionText)
                  await new Promise((r) => setTimeout(r, 1000))
                }}
                loadingText="Copied!"
              >
                Copy
              </Button>{' '}
              <div style={{ maxWidth: '400px', overflow: 'scroll' }}>
                <code>{ceremony.contributionText}</code>
              </div>
            </div>
          )}
        </div>
        <div className="contribute-right">
          <img src={require('../../public/cosmos1.svg')} />
        </div>

        {/* <div
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
                  This tab <strong>must</strong> remain active for you to stay
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
        </div> */}
      </div>
    </>
  )
})
