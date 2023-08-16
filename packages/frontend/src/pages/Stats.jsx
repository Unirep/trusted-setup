import React from 'react'
import { observer } from 'mobx-react-lite'
import Header from '../components/Header'
import ContributionCard from '../components/ContributionCard'
import Footer from '../components/Footer'
import './stats.css'

import state from '../contexts/state'

export default observer(() => {
  const { ui, ceremony } = React.useContext(state)
  return (
    <>
      <Header />

      <div className="stats-container">
        <div>
          <div className="stats-heading">CEREMONY STATS</div>
          <div className="stats-link">
            <a
              href={new URL('/transcript', ceremony.HTTP_SERVER).toString()}
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
                    ceremony.HTTP_SERVER
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
        {ceremony.transcript.map((d) => (
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

      <Footer />
    </>
  )
})
