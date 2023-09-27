import React, { useContext } from 'react'
import state from '../contexts/state'
import './footer.css'

export default () => {
  const { ui } = useContext(state)

  return (
    <div className="footer">
      <img
        src={require(`../../public/logo_${
          ui.isMobile ? 'notext' : 'footer'
        }.svg`)}
        alt="unirep logo"
      />
      <div className="footer-flex">
        <a
          href="https://developer.unirep.io/assets/files/VAR_Unirep-fd2248829d28ad53c4c2a01ef87d9015.pdf"
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
