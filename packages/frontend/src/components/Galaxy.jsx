import React from 'react'
import { observer } from 'mobx-react-lite'
import { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import init, { CosmoSim } from 'wasm'

export default observer(() => {
  const [fmm, setFmm] = useState(null)
  const canvasRef = useRef(null)

  const N = 10000
  const fov = 75
  const aspect = 1
  const near = 0.1
  const far = 5
  const astronomical_unit = 1e11

  useEffect(() => {
    init().then(() => {
      setFmm(new CosmoSim(N, astronomical_unit, 1e24, 700, 700))
    })
  })

  useEffect(() => {
    if (!fmm) return
    const canvas = canvasRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })

    // const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    let camera = new THREE.PerspectiveCamera(
      35,
      aspect,
      0.01 * astronomical_unit,
      10000 * astronomical_unit
    )
    camera.position.set(0, 0.2 * astronomical_unit, astronomical_unit)
    camera.position.z = 2

    const scene = new THREE.Scene()

    const boxWidth = 1
    const boxHeight = 1
    const boxDepth = 1
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

    const particleGeometry = new THREE.BufferGeometry()
    let positions = fmm.get_position()
    let mass = new Float32Array(1 * N)
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )
    particleGeometry.setAttribute('mass', new THREE.BufferAttribute(mass, 1))

    const particleShader = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSrc,
      fragmentShader: fragmentShaderSrc,
      uniforms: {},
    })

    scene.add(camera)
    const cameraControls = new OrbitControls(camera, renderer.domElement)
    cameraControls.noPan = false
    var light = new THREE.AmbientLight(0xffffff)
    scene.add(light)
    const particleSystem = new THREE.Points(particleGeometry, particleShader)
    scene.add(particleSystem)

    const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 }) // greenish blue

    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    function render(time) {
      renderer.render(scene, camera)
      fmm.simulate(50 * time)
      positions = fmm.get_position()
      // TODO do gpu based update
      particleGeometry.attributes.position.array = positions
      particleGeometry.attributes.position.needsUpdate = true

      requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
  }, [fmm])

  return <canvas width="600" height="600" ref={canvasRef} />
})

const vertexShaderSrc = `
  varying vec3 vPosition;
  varying float vMass;

  attribute float mass;

  void main() {
    vPosition = position;
    vMass = mass;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    gl_PointSize = 1.;
  }
`

const fragmentShaderSrc = `
const float PI = 3.1415926;

varying vec3 vPosition;
varying float vMass;

void main() {
    vec3 color = vMass * vec3(236., 46., 0.) + (1. - vMass) * vec3(1., 94., 158.);
    gl_FragColor = vec4(color / 255., 1.0);
}

  `
