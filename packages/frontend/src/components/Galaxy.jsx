import React from 'react'
import { observer } from 'mobx-react-lite'
import { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import init, { CosmoSim } from '../../wasm/rust_ffm'

export default observer(() => {
  const [fmm, setFmm] = useState(null)
  const canvasRef = useRef(null)

  const N_plummer = 1000
  const N_disk = 200
  const N_halo = 300
  const N_bulge = 400
  const N_spheres = 1
  const AU = 1e11

  useEffect(() => {
    init().then(() => {
      setFmm(
        new CosmoSim(N_plummer, N_disk, N_bulge, N_halo, AU, N_plummer * 1e24)
      )
    })
  }, [])

  useEffect(() => {
    if (!fmm) return
    const canvas = canvasRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })

    // const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    let camera = new THREE.PerspectiveCamera(35, 1, 0.01, 10000 * AU)
    camera.position.set(0, 0, 1.7 * AU)

    const scene = new THREE.Scene()
    let clock = new THREE.Clock()

    const particleGeometry = new THREE.BufferGeometry()
    let positions = new Float32Array(3 * N_plummer)
    let mass = new Float32Array(N_plummer).fill(1, 0, N_spheres * N_plummer)
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

    const cameraControls = new OrbitControls(camera, renderer.domElement)
    cameraControls.noPan = false

    const particleSystem = new THREE.Points(particleGeometry, particleShader)

    scene.add(camera)
    scene.add(particleSystem)

    function render() {
      var seconds = clock.getDelta()
      if (seconds > 1) {
        seconds = 1
      }
      const timestep = seconds * 60 * 60 * 24 * 15
      console.log(`${timestep / 1000} ms`)
      fmm.simulate(timestep)
      positions = fmm.get_position()

      const buf = new THREE.BufferAttribute(new Float32Array(positions), 3)
      particleGeometry.setAttribute('position', buf)
      particleGeometry.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
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
