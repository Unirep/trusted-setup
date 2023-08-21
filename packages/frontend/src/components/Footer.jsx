import React, { useContext } from 'react'
import state from '../contexts/state'
import './footer.css'

export default () => {
  const { ui } = useContext(state)

  return (
    <div className="footer">
      {!ui.isMobile ? (
        <img
          src={require('../../public/logo_footer.svg')}
          alt="unirep ceremony logo"
        />
      ) : (
        <img
          src={require('../../public/logo_notext.svg')}
          alt="unirep ceremony logo"
        />
      )}
      <div className="footer-flex">
        {/* need link to report here */}
        <a
          href="https://github.com/Unirep"
          target="blank"
          className="footer-link"
        >
          Audit report
        </a>
        <a
          href="https://github.com/Unirep"
          target="blank"
          className="footer-link"
        >
          UniRep Protocol
        </a>
      </div>
    </div>
  )
}