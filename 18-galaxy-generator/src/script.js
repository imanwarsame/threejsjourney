import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import Stats from 'three/examples/jsm/libs/stats.module.js';

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Stats
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const galaxyParameters = {
    count: 1000,
    size: 0.02
}

let galaxyGeometry = null
let galaxyMaterial = null
let galaxyPoints = null

const generateGalaxy = () => {
    //Destroy old geometry
    console.log(galaxyMaterial);
    if (galaxyPoints !== null) {
        galaxyGeometry.dispose()
        galaxyMaterial.dispose()
        scene.remove(galaxyPoints)
    }


    galaxyGeometry = new THREE.BufferGeometry()

    // Array containing each particle positions [x,y,z, x,y,z, ...]
    const positions = new Float32Array(galaxyParameters.count * 3)

    // Loop through 3 times the number of particles to generate x, y & z properties
    for (let i = 0; i < galaxyParameters.count * 3; i++) {
        // Random values between -0.5 and 0.5 multiplied by magnitude factor of 10
        positions[i] = (Math.random() - 0.5) * 10        
    }

    // Create the Three.js BufferAttribute and specify that each object is composed of 3 parameters
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Material
    galaxyMaterial = new THREE.PointsMaterial({
        size: galaxyParameters.size,
        sizeAttenuation: true, // Specify if distant particles should be smaller than close particles
        depthWrite: true,
        blending: THREE.AdditiveBlending
    })

    // Points
    galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial)
    scene.add(galaxyPoints)
}

generateGalaxy()

// Add tweaks
gui.add(galaxyParameters, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()

    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick()