import React, { useContext } from 'react'
import state from '../contexts/state'
import './footer.css'

export default () => {
  const { ui } = useContext(state)

  return (
    <div className="footer">
      <img
        src={require('../../public/logo_footer.svg')}
        alt="unirep ceremony logo"
      />
      <div style={{ display: 'flex' }}>
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
