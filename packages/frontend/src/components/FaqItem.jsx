import React from 'react'
import { observer } from 'mobx-react-lite'
import './faqItem.css'

export default observer(({ Id, question, answer, Index, setIndex }) => {
  const handleSetIndex = (Id) => (Index === Id ? setIndex(0) : setIndex(Id))
  return (
    <>
      <div onClick={() => handleSetIndex(Id)} className="faq-item">
        <div>{question}</div>
        {Index !== Id ? (
          <img
            src={require('../../public/arrow_dropdown.svg')}
            alt="arrow pointing down"
          />
        ) : (
          <img
            src={require('../../public/arrow_collapse.svg')}
            alt="arrow pointing up"
          />
        )}
      </div>
      {Index === Id && <div className="faq-answer">{answer}</div>}
    </>
  )
})
