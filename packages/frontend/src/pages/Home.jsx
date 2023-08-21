import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './home.css'
import Header from '../components/Header'
import Welcome from './Welcome'
import ContributionCard from '../components/ContributionCard'
import FaqDropdown from '../components/FaqDropdown'
import Footer from '../components/Footer'
import state from '../contexts/state'
import { HTTP_SERVER } from '../config'

export default observer(() => {
  const { ui, ceremony } = React.useContext(state)
  if (!HTTP_SERVER) {
    return <Welcome />
  }
  return (
    <>
      <Header />

      <div className="hero-bg">
        <img
          className="cosmos-1"
          src={require('../../public/cosmos1.svg')}
          alt="cosmic image"
        />
        {!ui.isMobile ? (
          <>
            <img
              className="cosmos-2"
              src={require('../../public/cosmos2.svg')}
              alt="cosmic image"
            />
            <img
              className="cosmos-3"
              src={require('../../public/cosmos3.svg')}
              alt="cosmic image"
            />
          </>
        ) : null}
        <div className="hero-container">
          <div className="hero-title">THE CELESTIAL CALL</div>
          <div className="hero-text">
            The Ceremony is our shared stargazing hour, a symphony of
            cryptography and purpose. Each contribution a star ignited, knitting
            together the constellation that unveils our journey.
          </div>
          <div className="hero-text">Do you hear the cosmic call?</div>
          <div className="flex-center">
            <Link to="/contribute/?s=dev2.http.ceremony.unirep.io">
              <div className="hero-button">Open Chapter</div>
            </Link>
          </div>
        </div>
      </div>

      <div className="info-container">
        <div className="info-left">
          <div className="info-stripe"></div>
          <div className="info-title">What is UniRep ceremony?</div>
        </div>
        <div className="info-center">
          <div className="info-stripe"></div>
          <div className="info-stripe"></div>
          <div className="info-stripe"></div>
          <div className="info-stripe"></div>
          <div className="info-stripe"></div>
          <div className="info-stripe"></div>
          <div className="info-stripe"></div>
          <div className="info-stripe"></div>
          <div className="info-stripe"></div>
          <div className="info-stripe"></div>
        </div>
        <div className="info-right">
          <div className="info-text">
            UniRep is a Zero-Knowledge Protocol for user data & reputation
            management. We use pioneering technology to offer a space for
            developers and users alike to explore the potential of
            privacy-centered online interactions.
          </div>
          <div className="info-text">
            We are releasing the official version and it’s to generate a
            structured reference string (SRS) which is needed for the
            commitments to work. An SRS is secure as long as at least one
            participant in the ceremony successfully conceals their secret.
          </div>
          <div className="info-text">
            This is a multi-party ceremony: each contributor creates a secret
            and runs a computation to mix in with previous contributions. Then,
            the output is made public and passed to the next contributor. To
            guard against attempts to corrupt the ceremony, participants need an
            Ethereum address or GitHub account with an established history to
            participate. The final output of the Ceremony will be included in a
            future upgrade to help scale the Ethereum network.
          </div>
        </div>
      </div>

      <div className="bottom-container">
        <div className="contribution-heading">Latest contributions</div>
        <div className="contributions">
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
        <div className="flex-center">
          <Link to="/stats/?s=dev2.http.ceremony.unirep.io">
            <div className="view-cont-button">View all</div>
          </Link>
        </div>

        <div className="faq-container">
          <div className="faq-heading">FAQ</div>
          <FaqDropdown />
          <div className="flex-center" style={{ paddingTop: '6rem' }}>
            <div className="hero-button">back to top</div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
})
