import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import './pagination.css'

export default observer(({ nPages, currentPage, setCurrentPage }) => {
  const pageNumbers = [...Array(nPages + 1).keys()].slice(1)

  const nextPage = () => {
    if (currentPage !== nPages) setCurrentPage(currentPage + 1)
  }
  const prevPage = () => {
    if (currentPage !== 1) setCurrentPage(currentPage - 1)
  }

  return (
    <nav>
      <div className="page-item" onClick={prevPage}>
        <img
          src={require('../../public/arrow_previous.svg')}
          alt="previous page arrow"
        />
      </div>

      {pageNumbers.map((pgNum) => (
        <div
          key={pgNum}
          className={`page-item ${currentPage == pgNum ? 'active' : ''}`}
          onClick={() => setCurrentPage(pgNum)}
        >
          {pgNum}
        </div>
      ))}

      <div className="page-item" onClick={nextPage}>
        <img
          src={require('../../public/arrow_next.svg')}
          alt="next page arrow"
        />
      </div>
    </nav>
  )
})
