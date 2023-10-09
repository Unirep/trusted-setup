import React from 'react'
import { observer } from 'mobx-react-lite'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import './contributionCard.css'
import state from '../contexts/state'

dayjs.extend(relativeTime)

export default observer(({ index, name, hash, createdAt }) => {
  const { ui } = React.useContext(state)
  return (
    <div className="card">
      <div className="card-text">
        <div className="card-mobile">
          <div className="card-index">{index}</div>
          <div>
            <strong>
              {name === 'anonymous contributor' ||
              name === 'anonymous cli contributor'
                ? 'anon'
                : name.slice(0, 12)}
            </strong>
          </div>
        </div>
        <div className="card-hash">
          {ui.isMobile ? hash.slice(0, 25) : hash.slice(0, 20)}...
        </div>
        <div>{dayjs(createdAt).from(dayjs())}</div>
      </div>
    </div>

    // old card with cosmos image
    // <div className="card">
    //   <img src={require('../../public/galaxy.svg')} alt="galaxy" />
    //   <div className="card-text">
    //     <div>
    //       <strong>{name === 'anonymous contributor' ? 'anon' : name}</strong>
    //     </div>
    //     <div style={{ paddingTop: '0.5rem' }}>{circuit.slice(0, 16)}</div>
    //     <div className="card-hash">{hash.slice(0, 20)}..</div>
    //     <div className="card-flex">
    //       <div>#{index}</div>
    //       <div>{dayjs(createdAt).from(dayjs())}</div>
    //     </div>
    //   </div>
    // </div>
  )
})
