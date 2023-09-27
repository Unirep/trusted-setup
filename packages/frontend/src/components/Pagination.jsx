import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import './pagination.css'

export default observer(({ nPages, currentPage, setCurrentPage }) => {
  const pageNumbers = [...Array(nPages + 1).keys()].slice(1)
  let paginationNumbers = []
  if (pageNumbers) {
    let showMax = 5
    let endPage
    let startPage

    if (pageNumbers <= showMax) {
      startPage = 1
      endPage = pageNumbers.length
    } else {
      startPage = currentPage
      if (
        startPage != pageNumbers.length &&
        startPage + 1 != pageNumbers.length
      ) {
        endPage = currentPage + showMax - 1
      } else {
        endPage = pageNumbers.length
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
        <img
          src={require('../../public/arrow_previous.svg')}
          alt="previous page arrow"
        />
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
        <img
          src={require('../../public/arrow_next.svg')}
          alt="next page arrow"
        />
      </div>
    </nav>
  )
})
