import React from 'react'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default observer(() => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })
    renderer.setSize(300, 300)

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    camera.position.z = 5

    function animate() {
      requestAnimationFrame(animate)

      cube.rotation.x += 0.01
      cube.rotation.y += 0.01

      renderer.render(scene, camera)
    }

    animate()
  })
  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  )
})
