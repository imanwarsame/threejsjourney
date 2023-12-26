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
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColour: '#ff6030',
    outsideColour: '#1b3984'
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
    const colours = new Float32Array(galaxyParameters.count * 3)

    // Inside and outside colours
    const colourInside = new THREE.Color(galaxyParameters.insideColour)
    const colourOutside = new THREE.Color(galaxyParameters.outsideColour)

    // Loop through the number of particles to generate x, y & z properties
    for (let i = 0; i < galaxyParameters.count; i++) {
        const radius = Math.random() * galaxyParameters.radius
        const spinAngle = radius * galaxyParameters.spin
        const branchAngle = ((i % galaxyParameters.branches) / galaxyParameters.branches) * Math.PI * 2
        
        // Mixed colour based on distance from centre
        const mixedColour = colourInside.clone() // Clone colour to avoid changing the original
        mixedColour.lerp(colourOutside, radius / galaxyParameters.radius) // Mix!

        const randomX = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * (galaxyParameters.randomness * radius)
        const randomY = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * (galaxyParameters.randomness * radius)
        const randomZ = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * (galaxyParameters.randomness * radius)

        positions[(i * 3) + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[(i * 3) + 1] = 0 + randomY
        positions[(i * 3) + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        colours[(i * 3) + 0] = mixedColour.r
        colours[(i * 3) + 1] = mixedColour.g
        colours[(i * 3) + 2] = mixedColour.b
    }

    // Create the Three.js BufferAttribute and specify that each object is composed of 3 parameters
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Add colours
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colours, 3))

    // Material
    galaxyMaterial = new THREE.PointsMaterial({
        size: galaxyParameters.size,
        sizeAttenuation: true, // Specify if distant particles should be smaller than close particles
        depthWrite: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    // Points
    galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial)
    scene.add(galaxyPoints)
}

generateGalaxy()

// Add tweaks
gui.add(galaxyParameters, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(galaxyParameters, 'insideColour').onFinishChange(generateGalaxy)
gui.addColor(galaxyParameters, 'outsideColour').onFinishChange(generateGalaxy)
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

    // Rotate the galaxy
    if (galaxyPoints !== null) {
        galaxyPoints.rotation.y = elapsedTime * 0.05
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick()