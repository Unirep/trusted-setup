import React from 'react'
import { observer } from 'mobx-react-lite'
import './popup.css'

export default observer(({ open, onClose, title, content, button }) => {
  return (
    <div
      className="popup-container"
      style={{ display: open ? 'flex' : 'none' }}
    >
      <div className="popup">
        <div className="close" onClick={onClose}>
          &times;
        </div>
        <h2>{title}</h2>
        <p>{content}</p>
        {button}
      </div>
    </div>
  )
})
