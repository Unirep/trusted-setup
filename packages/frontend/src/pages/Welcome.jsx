import React from 'react'
import { observer } from 'mobx-react-lite'
import state from '../contexts/state'
import './welcome.css'

const FeatureCell = ({ text, children }) => (
  <div
    style={{
      width: '10rem',
      textAlign: 'center',
      border: '1px solid black',
      padding: '0.5rem',
    }}
  >
    {children}
  </div>
)

export default observer(() => {
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '20rem', textAlign: 'center' }}>
          A circuit agnostic trusted setup system for groth16 zk proofs.
        </div>
      </div>
      <div className="hdivider" />
      <div className="header2" style={{ alignSelf: 'center' }}>
        Features
      </div>
      <div style={{ height: '1rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <FeatureCell>Customizable authentication requirements.</FeatureCell>
        <FeatureCell>
          <a href="https://www.npmjs.com/package/trusted-setup" target="_blank">
            CLI implementation.
          </a>
        </FeatureCell>
        <FeatureCell>
          Websocket/HTTP transports for coordinating participation and moving
          data.
        </FeatureCell>
      </div>
      <div className="hdivider" />
      <div className="header2" style={{ alignSelf: 'center' }}>
        How does it work?
      </div>
      <div style={{ height: '1rem' }} />
      <div style={{ display: 'flex' }}>
        <div style={{ lineHeight: '1.2' }}>
          This webpage takes a query parameter{' '}
          <code style={{ display: 'inline' }}>?s=backend.url.com</code> that is
          used to load the ceremony information. This includes: circuit names,
          number of contributions, ceremony name, authentication options, etc.
          To run your own ceremony follow the instructions{' '}
          <a href="https://github.com/unirep/trusted-setup#readme">here</a> then
          link to this page with the{' '}
          <code style={{ display: 'inline' }}>s</code> query parameter set.
        </div>
      </div>
      <div style={{ height: '1rem' }} />
      <div className="header3">Demo instructions</div>
      <ul>
        <li>
          <code style={{ display: 'inline' }}>
            npx trusted-setup https://dev2.http.ceremony.unirep.io
          </code>
        </li>
        <li>
          <a href="/?s=dev2.http.ceremony.unirep.io">web link</a>
        </li>
        <li>Coming soon: immutable web links</li>
      </ul>
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
