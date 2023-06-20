import React from 'react'
import { observer } from 'mobx-react-lite'
import { SERVER } from '../config'
import dayjs from 'dayjs'
import state from '../contexts/state'

export default observer(() => {
  const { ui, ceremony } = React.useContext(state)
  const [data, setData] = React.useState([])
  const [activeCircuit, setActiveCircuit] = React.useState()
  React.useEffect(() => {
    if (!activeCircuit) {
      setActiveCircuit(ceremony.circuitNames[0])
    }
  }, [ceremony.circuitNames])
  React.useEffect(() => {
    const url = new URL('/transcript', SERVER)
    fetch(url.toString())
      .then((r) => r.json())
      .then((d) => setData(d))
  }, [])
  return (
    <div style={{ marginTop: '8px' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}
      >
        <div>Contributions by circuit</div>
        <div style={{ width: '4px' }} />
        <select
          onChange={(e) => setActiveCircuit(e.target.value)}
          value={activeCircuit}
        >
          {ceremony.circuitNames.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </div>
      <div style={{ border: '1px solid black', borderBottom: 'none' }}>
        <strong>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid black',
              marginBottom: '2px',
              padding: '4px',
            }}
          >
            <div>index</div>
            <div style={{ minWidth: '150px' }}>name</div>
            <div style={{ minWidth: '150px' }}>hash</div>
            <div>timestamp</div>
          </div>
        </strong>
        {data
          .filter((d) => d.circuitName === activeCircuit)
          .map((d) => (
            <div
              key={d._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid black',
                marginBottom: '2px',
                padding: '4px',
              }}
            >
              <div>{d.index}</div>
              <div style={{ minWidth: '150px' }}>{d.name}</div>
              <div style={{ minWidth: '150px', wordBreak: 'break-all' }}>
                {d.hash.slice(0, 16)}...
              </div>
              <div>{dayjs(d.createdAt).format('YYYY-MM-DD HH:mm')}</div>
            </div>
          ))}
      </div>
    </div>
  )
})
