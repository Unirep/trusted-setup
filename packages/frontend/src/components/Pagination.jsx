import React, { useContext, useState } from 'react'
import { observer } from 'mobx-react-lite'
import state from '../contexts/state'
import './pagination.css'

export default observer(({ nPages, currentPage, setCurrentPage }) => {
  const { ui } = useContext(state)
  const pageNumbers = [...Array(nPages + 1).keys()].slice(1)
  let paginationNumbers = []
  if (pageNumbers) {
    let showMax = ui.isMobile ? 3 : 5
    let endPage
    let startPage = 1

    if (pageNumbers <= showMax) {
      startPage = 1
      endPage = pageNumbers.length
    } else {
      if (currentPage === 1) {
        startPage = currentPage
        endPage = showMax
      } else if (currentPage === 2) {
        startPage = currentPage - 1
        endPage = showMax
      } else if (currentPage === pageNumbers.length) {
        startPage = currentPage - (ui.isMobile ? 2 : 4)
        endPage = currentPage
      } else if (currentPage === pageNumbers.length - 1) {
        startPage = currentPage - (ui.isMobile ? 1 : 3)
        endPage = currentPage + 1
      } else {
        startPage = currentPage - (ui.isMobile ? 1 : 2)
        endPage = currentPage + (ui.isMobile ? 1 : 2)
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      paginationNumbers.push(i)
    }
  }

  const nextPage = () => {
    if (currentPage !== nPages) setCurrentPage(currentPage + 1)
  }
  const prevPage = () => {
    if (currentPage !== 1) setCurrentPage(currentPage - 1)
  }

  return (
    <nav>
      <div className="page-item" onClick={prevPage}>
        {currentPage !== 1 ? (
          <img
            src={require('../../public/arrow_previous.svg')}
            alt="previous page arrow"
          />
        ) : null}
      </div>

      {paginationNumbers.map((pgNum) => (
        <div
          key={pgNum}
          className={`page-item ${currentPage == pgNum ? 'active' : ''}`}
          onClick={() => setCurrentPage(pgNum)}
        >
          {pgNum}
        </div>
      ))}

      <div className="page-item" onClick={nextPage}>
        {currentPage !== pageNumbers.length ? (
          <img
            src={require('../../public/arrow_next.svg')}
            alt="next page arrow"
          />
        ) : null}
      </div>
    </nav>
  )
})
