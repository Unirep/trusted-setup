import React from 'react'
import { observer } from 'mobx-react-lite'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import './contributionCard.css'

dayjs.extend(relativeTime)

export default observer(({ index, name, hash, createdAt, circuit }) => {
  return (
    <div className="card">
      <img src={require('../../public/galaxy.svg')} alt="galaxy" />
      <div className="card-text">
        <div>
          <strong>{name === 'anonymous contributor' ? 'anon' : name}</strong>
        </div>
        <div style={{ paddingTop: '0.5rem' }}>{circuit.slice(0, 16)}</div>
        <div className="card-hash">{hash.slice(0, 20)}..</div>
        <div className="card-flex">
          <div>#{index}</div>
          <div>{dayjs(createdAt).from(dayjs())}</div>
        </div>
      </div>
    </div>
  )
})
