import React, { useContext } from 'react'
import state from '../contexts/state'
import './infoContainer.css'

export default ({ title, texts, button }) => {
  const { ui } = useContext(state)

  return (
    <div className="info-container">
      <div className="info-content">
        <div className="info-left">
          {!ui.isMobile ? (
            <>
              <div className="info-stripe"></div>
              <div className="info-bottom">
                <div
                  className="info-title"
                  style={{ fontSize: `${title.length > 24 ? '3rem' : '4rem'}` }}
                >
                  {title}
                </div>
                {button}
              </div>
            </>
          ) : (
            <>
              <div
                className="info-title"
                style={{ fontSize: `${title.length > 24 ? '1.5rem' : '2rem'}` }}
              >
                {title}
              </div>
              <div className="info-post-button">{button}</div>
            </>
          )}
        </div>
        <div className="info-center">
          <div className="info-stripe"></div>
          <div className="info-stripe"></div>
          <div className="info-stripe"></div>
          {!ui.isMobile ? (
            <>
              <div className="info-stripe"></div>
              <div className="info-stripe"></div>
              <div className="info-stripe"></div>
              <div className="info-stripe"></div>
              <div className="info-stripe"></div>
              <div className="info-stripe"></div>
              <div className="info-stripe"></div>
            </>
          ) : null}
        </div>
        <div className="info-right">
          {texts.map((t, i) => (
            <div className="info-text" key={i}>
              {t}
            </div>
          ))}
        </div>
        {ui.isMobile ? (
          <div className="info-center">
            <div className="info-stripe"></div>
            <div className="info-stripe"></div>
            <div className="info-stripe"></div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
