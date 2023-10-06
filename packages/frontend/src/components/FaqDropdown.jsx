import React from 'react'
import { observer } from 'mobx-react-lite'
import FaqItem from './FaqItem'

export default observer(() => {
  const [Index, setIndex] = React.useState(1)
  const faqs = [
    {
      id: 1,
      Q: <div>What's the Celestial Call?</div>,
      A: (
        <div>
          The Celestial Call is a momentous occasion within the UniRep
          multiverse. It's a ritualistic gathering that allows participants to
          contribute their unique 'sparks' to the project. Each contribution
          adds to the secure and anonymous framework of UniRep, strengthening
          its fabric and expanding its reach into the privacy-first multiverse.
          This is not merely a technical exercise but an alignment of visions; a
          shared undertaking that invites you to be a part of a new reality
          where privacy is the norm.
        </div>
      ),
    },
    {
      id: 2,
      Q: <div>Why does UniRep need a ceremony?</div>,
      A: (
        <div>
          The Celestial Call ceremony will generate the secure proving keys that
          enable UniRep's trustless zero-knowledge system. It ensures that no
          single entity has control over the system, reinforcing the values of
          decentralization communal ownership of technology for societal good.
          It's both an inception and a passage — a way to kickstart the project
          while involving the community in its creation and maintenance.
        </div>
      ),
    },
    {
      id: 3,
      Q: <div>How do I contribute to this ceremony?</div>,
      A: (
        <>
          <div>
            You can choose to contribute by authenticating via GitHub or
            Discord, or opting for a 'free ride' without any authentication.
            Alternatively, you can use our CLI tool. Just download the{' '}
            <a
              href="https://www.npmjs.com/package/trusted-setup"
              target="blank"
            >
              trusted-setup
            </a>{' '}
            package from npm and follow these simple steps:
          </div>
          <div style={{ paddingTop: '0.5rem' }}>1. Install the package</div>
          <div>
            2. Run <strong>npx trusted-setup</strong>
          </div>
          <div className="faq-cli">
            3. Use:
            <div className="faq-url">https://http.ceremony.unirep.io</div>
            to contribute
          </div>
        </>
      ),
    },
    {
      id: 4,
      Q: <div>What takes place during my contribution?</div>,
      A: (
        <div>
          After you've chosen your method of authentication, the system will
          automatically download the previous contributions to your local
          machine. You'll then compute your own contributions locally before
          they are uploaded back to our server. Everything is automated for ease
          and convenience. Additionally, you're invited to play around with our
          Cosmos Simulator to create your own mini-multiverse!
        </div>
      ),
    },
    {
      id: 5,
      Q: <div>What's the duration of the Celestial Call?</div>,
      A: (
        <div>
          The ceremony is planned to run for 64 days, beginning on October 10th,
          2023 and concluding on December 12th, 2023. After this period, we'll
          compile all contributions, finalize the transcripts, and unveil the
          collaborative multiverse. You are welcome to revisit and verify your
          individual contribution and the final result.
        </div>
      ),
    },
    {
      id: 6,
      Q: <div>Are there rewards for contributing?</div>,
      A: (
        <div>
          The Celestial Call is about building a public good and fortifying the
          protocol's security; there are no financial incentives like airdrops
          or tokens. Your contribution is a vital support to UniRep's secure
          foundation, and we extend our deepest gratitude for your participation
          in this endeavor to unite privacy and community.
        </div>
      ),
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
