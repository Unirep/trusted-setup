import React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Link, useLocation } from 'react-router-dom'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Header from '../components/Header'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import ServerState from '../components/ServerState'
import InfoContainer from '../components/InfoContainer'
import { HTTP_SERVER } from '../config'
import state from '../contexts/state'
import './contribute.css'
import Popup from '../components/Popup'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import init, { CosmoSim } from '../../wasm'
import { ethers } from 'ethers'

const ContributeState = {
  loading: 0,
  normal: 1,
  queueing: 2,
  contributing: 3,
  finished: 4,
  offline: 5,
}

const vertexShaderSrc = `
  varying vec3 vPosition;
  varying float vMass;

  attribute float mass;

  void main() {
    vPosition = position;
    vMass = mass;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    gl_PointSize = max(1., vMass);
  }
`

const fragmentShaderSrc = `
varying vec3 vPosition;
varying float vMass;

void main() {
    vec3 color = vMass * vec3(163., 236., 225.) + (1. - vMass) * vec3(230., 72., 16.);
    if (vMass > 1.) color = vec3(254., 228., 203.);
    gl_FragColor = vec4(color / 255., 1.0);
}
`

const hashString = (s) => {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(s))
}

export default observer(() => {
  const [fmm, setFmm] = useState(null)

  const N_plummer = 8000
  const N_particles = 42000
  const AU = 1e11

  const [name, setName] = React.useState('')
  const [error, setError] = React.useState('')
  const [postMessage, setPostMessage] = React.useState({})
  const [cosmoCanvasReady, setCosmoCanvasReady] = React.useState(false)
  const [disableLink, setDisableLink] = React.useState(false)

  const { hash } = useLocation()
  const { ceremony, ui } = React.useContext(state)
  const [contributeState, setContributeState] = React.useState(
    !ceremony.connected || ceremony.loadingInitial
      ? ContributeState.loading
      : ContributeState.normal
  )

  // twitter oauth only do post, so combine oauth and post together
  React.useEffect(() => {
    const url = new URL(window.location)
    if (url.searchParams.get('twitter_post_url')) {
      setPostMessage({
        platform: 'twitter',
        url: url.searchParams.get('twitter_post_url'),
      })
      url.searchParams.delete('twitter_post_url')
      window.history.pushState({}, null, url.toString())
    }
  }, [])

  // read error from redirect url
  React.useEffect(() => {
    const url = new URL(window.location)
    if (url.searchParams.get('error')) {
      setError(url.searchParams.get('error'))
    }
  }, [])

  // gist post function is not included in oauth, so need to call it after contributionHashes loaded
  React.useEffect(() => {
    if (ceremony.isPostingGist) {
      postOnGithub()
      ceremony.isPostingGist = false
    }
  }, [ceremony.isPostingGist])

  React.useEffect(() => {
    if (!ceremony.connected) setContributeState(ContributeState.offline)
    else if (ceremony.loadingInitial)
      setContributeState(ContributeState.loading)
    else if (ceremony.inQueue) {
      setDisableLink(true)
      if (ceremony.isActive) {
        setContributeState(ContributeState.contributing)
        setTimeout(() => setCosmoCanvasReady(true), 1000) // test to wait for 1 sec to setup the cosmo canvas
      } else setContributeState(ContributeState.queueing)
    } else if (ceremony.contributionHashes) {
      setDisableLink(false)
      setContributeState(ContributeState.finished)
      setTimeout(() => setCosmoCanvasReady(true), 1000) // test to wait for 1 sec to setup the cosmo canvas
    } else setContributeState(ContributeState.normal)
  }, [
    ceremony.connected,
    ceremony.loadingInitial,
    ceremony.inQueue,
    ceremony.contributionHashes,
    ceremony.isActive,
  ])

  React.useEffect(() => {
    if (error.length > 0) {
      toast.error('error: ' + error, {
        onClose: () => {
          setError('')
          const url = new URL(window.location)
          url.searchParams.delete('error')
          window.history.pushState({}, null, url.toString())
        },
      })
    }
  }, [error])

  React.useEffect(() => {
    init().then(() => {
      setFmm(new CosmoSim(N_plummer, 5 * AU, N_plummer * 1e24, 10 * AU))
    })
  }, [])

  React.useEffect(() => {
    if (cosmoCanvasReady) {
      const width = window.innerWidth > 1310 ? 1310 : window.innerWidth * 0.9
      const height = window.innerHeight * 0.5

      const canvas = document.getElementById('cosmo')
      canvas.width = width
      canvas.height = height
      const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })

      // set camera
      let camera = new THREE.PerspectiveCamera(
        // fov
        35,
        // aspect
        width / height,
        // near
        0.01,
        // far
        10000 * AU
      )
      const defaultZoom = 1.7 * AU
      camera.position.set(0, 0, defaultZoom)

      const scene = new THREE.Scene()
      let clock = new THREE.Clock()

      // create particle buffers
      const particleGeometry = new THREE.BufferGeometry()
      const initialRandomParticlesCount = 10
      let blackHoleCount = 0
      let positions = new Float32Array(3 * N_plummer)
      let mass = new Float32Array(N_particles).fill(1, 0, N_plummer)
      particleGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      )
      particleGeometry.setAttribute('mass', new THREE.BufferAttribute(mass, 1))

      // create plane
      const planeGeometry = new THREE.PlaneGeometry(AU, AU, 8, 8)
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x4d4d4d,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
      })

      // create hidden plane
      const hiddenPlaneGeometry = new THREE.PlaneGeometry(
        10 * AU,
        10 * AU,
        8,
        8
      )
      const hiddenPlaneMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.0,
      })

      // for particle colors
      const particleShader = new THREE.ShaderMaterial({
        vertexShader: vertexShaderSrc,
        fragmentShader: fragmentShaderSrc,
        uniforms: {},
      })

      const cameraControls = new OrbitControls(camera, renderer.domElement)
      cameraControls.noPan = false

      const vFOV = THREE.MathUtils.degToRad(camera.fov) // convert vertical fov to radians
      const scene_height = 2 * Math.tan(vFOV / 2) * camera.position.z // visible height
      const scene_width = scene_height * camera.aspect
      const rect = canvas.getBoundingClientRect()
      const particleSystem = new THREE.Points(particleGeometry, particleShader)
      const plane = new THREE.Mesh(planeGeometry, planeMaterial)
      const hiddenPlane = new THREE.Mesh(
        hiddenPlaneGeometry,
        hiddenPlaneMaterial
      )

      scene.add(camera)
      scene.add(particleSystem)
      scene.add(plane)
      scene.add(hiddenPlane)

      const insertParticle = (_x, _y) => {
        fmm.insert_particle(_x, _y, 0, 1e28)
        blackHoleCount += 1
        mass = new Float32Array(mass.length + 1)
          .fill(1, 0, N_plummer)
          .fill(3, N_particles, mass.length + 1)
        particleGeometry.setAttribute(
          'mass',
          new THREE.BufferAttribute(mass, 1)
        )
        particleGeometry.attributes.mass.needsUpdate = true
      }

      let hash = hashString(name)
      for (let i = 0; i < initialRandomParticlesCount; i++) {
        const a = hash.slice(2, hash.length / 2)
        const b = hash.slice(hash.length / 2)
        const r = parseInt(`0x${a}`, 16) % AU
        const theta = parseInt(`0x${b}`, 16) % (2 * Math.PI)
        insertParticle(r * Math.cos(theta), r * Math.sin(theta))
        hash = hashString(hash)
      }

      canvas.addEventListener('dblclick', (e) => {
        console.log('clicked', name)
        const _x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        const _y = -((e.clientY - rect.top - 70) / rect.height) * 2 + 1
        const mouse = new THREE.Vector2(_x, _y)
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, camera)
        const hit = raycaster.intersectObject(hiddenPlane)
        if (!hit.length) return
        const px = hit[0].point.x
        const py = hit[0].point.y
        insertParticle(px, py)
      })

      function render() {
        var seconds = clock.getDelta()
        if (seconds > 1) {
          seconds = 1
        }
        const timestep = seconds * 60 * 60 * 24 * 15 * 4
        fmm.simulate(timestep)
        positions = fmm.get_position()

        const buf = new THREE.BufferAttribute(new Float32Array(positions), 3)
        particleGeometry.setAttribute('position', buf)
        particleGeometry.attributes.position.needsUpdate = true

        renderer.render(scene, camera)
        requestAnimationFrame(render)
      }
      requestAnimationFrame(render)
    }
  }, [cosmoCanvasReady, fmm])

  const splitContributionText = () => {
    const circuitKeys = ceremony.contributionHashes
      ? Object.entries(ceremony.contributionHashes).map(
          ([circuit, hash]) => `${circuit}:\n${hash}`
        )
      : []

    return [
      `I, as ${ceremony.contributionName}, just contributed to the UniRep trusted setup ceremony!`,
      'My circuit hashes are as follows:',
      ...circuitKeys,
    ]
  }

  const postOnGithub = async () => {
    const access_token = localStorage.getItem('github_access_token')
    if (!access_token) {
      await ceremony.oauth('/oauth/github', false, true)
    } else {
      const url = await ceremony.postGist()
      console.log('gist url:', url)
      setPostMessage({ platform: 'gist', url })
    }
  }

  const postOnTwitter = async () => {
    const url = new URL('/oauth/twitter', HTTP_SERVER)
    url.searchParams.set('token', ceremony.authToken)
    const currentUrl = new URL(window.location.href)
    const dest = new URL('/contribute', currentUrl.origin)
    url.searchParams.set('redirectDestination', dest.toString())
    url.searchParams.set(
      'content',
      `✨ UniRep Ceremony ✨\nI just contributed to UniRep trusted setup ceremony.\nContribute to help secure the UniRep protocol here: ${currentUrl.origin}\n\nGenerate your own verse and help secure the UniRep protocol.`
    )
    window.location.replace(url.toString())
  }

  const gotoPost = () => {
    window.open(postMessage.url, '_blank')
    setPostMessage({})
  }

  return (
    <>
      <ToastContainer position="top-center" theme="colored" />
      <Popup
        open={postMessage.platform}
        onClose={() => setPostMessage({})}
        title="Post Successfully!"
        content={`Post on ${postMessage.platform} successfully.`}
        button={
          <Button
            style={{
              borderRadius: '24px',
              color: 'black',
              padding: '12px 24px',
              fontWeight: '600',
            }}
            onClick={gotoPost}
          >
            Go to post
          </Button>
        }
      />

      {!cosmoCanvasReady && (
        <div
          className={`contribute-bg ${
            !ui.isMobile && 'contribute-container contribute-whole-page'
          }`}
        >
          <div className="contribute-wrapper">
            <div
              className={
                !ui.isMobile
                  ? 'contribute-child upper-left-anchor'
                  : 'padding padding-top'
              }
            >
              <div className="contribute-main">
                <Link
                  to={`${disableLink ? '' : '/'}`}
                  // style={{
                  //   pointerEvents:
                  //     contributeState === ContributeState.queueing ||
                  //     contributeState === ContributeState.contributing
                  //       ? 'none'
                  //       : '',
                  // }}
                >
                  <img
                    src={require('../../public/logo_footer.svg')}
                    alt="unirep ceremony logo"
                  />
                </Link>
                <ServerState />

                {contributeState === ContributeState.offline && (
                  <b>
                    Server is offline at this moment. It's better to come back
                    later.
                  </b>
                )}
                {contributeState === ContributeState.loading && (
                  <p>Loading...</p>
                )}
                {(contributeState === ContributeState.normal ||
                  contributeState === ContributeState.offline ||
                  contributeState === ContributeState.queueing ||
                  contributeState === ContributeState.contributing) && (
                  <p>
                    Beyond digital horizons, a nebulous archway glimmers... join
                    UniRep on the path to a realm where privacy's song fills the
                    air.
                  </p>
                )}
                {contributeState === ContributeState.normal &&
                  hash &&
                  hash === '#cli' && (
                    <div className="contribute-cli-field">
                      <h4>Contribute by CLI</h4>
                      <div>
                        <li>
                          download{' '}
                          <a
                            href="https://github.com/Unirep/trusted-setup"
                            blank="_"
                          >
                            trusted-setup
                          </a>{' '}
                          package
                        </li>
                        <div style={{ height: '1rem' }}></div>
                        <li>
                          run:{' '}
                          <code className="cli">
                            <img
                              src={require('../../public/copy.svg')}
                              alt="copy icon"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  'npx trusted-setup https://http.ceremony.unirep.io'
                                )
                              }
                              className="copy"
                            />
                            npx trusted-setup https://http.ceremony.unirep.io
                          </code>
                        </li>
                      </div>
                    </div>
                  )}
                {contributeState === ContributeState.normal &&
                  hash !== '#cli' && (
                    <div>
                      <div className="contribute-field">
                        <input
                          type="text"
                          placeholder="Contribute as Anon"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <Tooltip
                          style={{ filter: 'invert(100%)' }}
                          text="This name will be permanently associated with this contribution. Choose anything you like, it doesn't have to be unique."
                        />
                        <Button
                          style={{
                            borderRadius: '24px',
                            color: 'black',
                            padding: '12px 24px',
                            fontWeight: '600',
                          }}
                          onClick={async () => {
                            try {
                              await ceremony.join(name, 'open')
                            } catch (e) {
                              setError(e)
                            }
                          }}
                        >
                          start contributing
                        </Button>
                      </div>
                      <p className="interline">
                        ----------------------------------------------------------------------------------
                      </p>
                      <p>Or contribute with your social profiles</p>
                      <div className="contribute-field">
                        {ceremony.bootstrapData?.authOptions?.map((option) => {
                          if (option.type !== 'none') {
                            return (
                              <Button
                                style={{
                                  borderRadius: '24px',
                                  color: 'black',
                                  padding: '12px 24px',
                                  fontWeight: '600',
                                }}
                                key={option.name}
                                onClick={async () => {
                                  if (option.type === 'none') {
                                    await ceremony.join(name, 'open')
                                  } else {
                                    await ceremony.oauth(name, option.path)
                                  }
                                }}
                              >
                                <img
                                  src={require(`../../public/${option.displayName.toLowerCase()}.svg`)}
                                  alt=""
                                />
                                <span>{option.displayName}</span>
                              </Button>
                            )
                          }
                        })}
                      </div>
                    </div>
                  )}
                {contributeState === ContributeState.queueing && (
                  <div className="message-box">
                    <p>
                      <strong>Authenticated.</strong>
                    </p>
                    <p>
                      Please hold until the portal opens, there{' '}
                      {ceremony.queueLength > 1
                        ? `are ${ceremony.queueLength} people `
                        : `is ${ceremony.queueLength} person `}{' '}
                      waiting ahead of you.
                    </p>
                    <p>
                      You can also leave this window open and come back later.
                    </p>
                  </div>
                )}
                {contributeState === ContributeState.contributing &&
                  !cosmoCanvasReady && (
                    <div className="message-box">
                      <p>
                        <strong>Authenticated.</strong>
                      </p>
                      <p>It's your turn now.</p>
                      <p>Opening portal & cosmos generator...</p>
                    </div>
                  )}
              </div>
            </div>

            <div className={ui.isMobile ? 'footer-bg' : 'contribute-child'}>
              <img src={require('../../public/cosmos1.svg')} />
            </div>
          </div>
        </div>
      )}
      {cosmoCanvasReady && (
        <div className="content">
          <Header logoOnly={true} disableLink={disableLink} />
          <div className="contribute-container">
            <div className="canvas-container">
              <canvas id="cosmo"></canvas>
              <p>
                <b className="canvas-message">
                  Zoom and rotate to explore your verse, double click to add
                  stars.
                </b>
              </p>
            </div>
          </div>

          {contributeState === ContributeState.contributing && (
            <div className="contribute-container" style={{ height: 'auto' }}>
              <div className="contribute-wrapper wrapper2">
                <div className="contribute-child padding2">
                  <h2>Contribution in progress</h2>
                  Please stay put while your machine makes contributions.
                </div>
                <div className="contribute-child padding2">
                  {contributeState === ContributeState.contributing && (
                    <p>
                      {ceremony.contributionUpdates.map((text, i) => (
                        <div key={i}>{text}</div>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {contributeState === ContributeState.finished && (
            <>
              <div className="contribute-container">
                <div
                  className="contribute-wrapper wrapper2"
                  style={{ height: 'auto' }}
                >
                  <div className="contribute-child padding2">
                    <h2 className="mint-color">Contribution completed!</h2>
                    Thank you for contributing.
                  </div>
                  <div className="contribute-child padding2">
                    <p>
                      You can continue to explore your verse here. Share &
                      invite others to contribute!
                    </p>
                    <Button
                      style={{
                        borderRadius: '24px',
                        color: 'black',
                        padding: '12px 24px',
                        fontWeight: '600',
                      }}
                      onClick={async () => postOnTwitter()}
                    >
                      Share on Twitter
                    </Button>
                  </div>
                </div>
              </div>
              <InfoContainer
                title="Post your contribution as Gist"
                texts={splitContributionText()}
                button={
                  <Button
                    style={{
                      borderRadius: '24px',
                      color: '#a3ece1',
                      padding: '12px 24px',
                      fontWeight: '600',
                      backgroundColor: 'black',
                    }}
                    onClick={postOnGithub}
                  >
                    Post on Github
                  </Button>
                }
              />
            </>
          )}
        </div>
      )}
    </>
  )
})
