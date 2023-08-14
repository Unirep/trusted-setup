import React from 'react'
import { observer } from 'mobx-react-lite'
import FaqItem from './FaqItem'

export default observer(() => {
  const [Index, setIndex] = React.useState(1)
  const faqs = [
    {
      id: 1,
      Q: 'what is a trusted setup?',
      A: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    {
      id: 2,
      Q: 'how do i participate?',
      A: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    {
      id: 3,
      Q: 'how long does it take to contribute?',
      A: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    {
      id: 4,
      Q: 'when does the ceremony end?',
      A: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
  ]

  return (
    <>
      {faqs.map((item) => {
        return (
          <FaqItem
            key={item.id}
            Id={item.id}
            question={item.Q}
            answer={item.A}
            Index={Index}
            setIndex={setIndex}
          ></FaqItem>
        )
      })}
    </>
  )
})
