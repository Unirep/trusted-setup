import React from 'react'
import { observer } from 'mobx-react-lite'
import Header from '../components/Header'
import ContributionCard from '../components/ContributionCard'
import Footer from '../components/Footer'
import { HTTP_SERVER } from '../config'
import './stats.css'

import state from '../contexts/state'

export default observer(() => {
  const { ui, ceremony } = React.useContext(state)
  const [activeCircuit, setActiveCircuit] = React.useState(
    ceremony.circuitNames[0]
  )
  React.useEffect(() => {
    if (!activeCircuit) {
      setActiveCircuit(ceremony.circuitNames[0])
    }
  }, [ceremony.circuitNames])

  return (
    <>
      <Header />

      <div className="stats-container">
        <div>
          <div className="stats-heading">CEREMONY STATS</div>
          <div className="stats-link">
            <a
              href={new URL('/transcript', HTTP_SERVER).toString()}
              target="_blank"
            >
              Full transcript
            </a>
          </div>
          <div className="stats-link">
            {ceremony.attestationUrl ? (
              <a href={ceremony.attestationUrl} target="_blank">
                Public attestations
              </a>
            ) : null}
          </div>
        </div>

        <div className="stats-categories">
          {ceremony.ceremonyState.circuitStats?.map((c) => (
            <div className="stat-item" key={c.name}>
              <div>{c.name}</div>
              <div className="stat-count">
                <div>{c.contributionCount}</div>
                <a
                  href={new URL(
                    `/contribution/${c.name}/latest`,
                    HTTP_SERVER
                  ).toString()}
                >
                  <img
                    src={require('../../public/download_arrow.svg')}
                    alt="download arrow"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="contribution-container">
        {/* old style displaying cards with cosmos images */}
        {/* {ceremony.transcript.map((d) => (
          <ContributionCard
            key={d._id}
            index={d.index}
            name={d.name}
            hash={d.hash}
            createdAt={d.createdAt}
            circuit={d.circuitName}
          ></ContributionCard>
        ))} */}

        <div className="circuit">
          <div>Contributions</div>
          <div className="view">view by circuit:</div>
          <div className="circuit-select">
            <select
              onChange={(e) => setActiveCircuit(e.target.value)}
              value={activeCircuit}
            >
              {ceremony.circuitNames.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="contribution-table">
          {ceremony.transcript
            .filter((d) => d.circuitName === activeCircuit)
            .map((d) => (
              <ContributionCard
                key={d._id}
                index={d.index}
                name={d.name}
                hash={d.hash}
                createdAt={d.createdAt}
                circuit={d.circuitName}
              ></ContributionCard>
            ))}
        </div>
      </div>

      <Footer />
    </>
  )
})
