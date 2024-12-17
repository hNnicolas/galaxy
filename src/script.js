import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */

// Debug gui
const gui = new GUI()
gui.title('Galaxy Settings')
gui.close()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy generation
 */
const parameters = 
{
    //galaxy parameters
    count: 36000,
    radius: 5,
    size: 0.01,
    branches: 6,
    spin: 3.1,
    randomness: 1.3,
    randPower: 7.2,
    insideColor: '#a82600',
    outsideColor: '#1b3984',

}

let geom = null
let material = null
let points = null

const generateGalaxy = () => 
{
    // Destroy old galaxy
    if(points != null)
    {
        geom.dispose()
        material.dispose()
        scene.remove(points)
    }

    geom = new THREE.BufferGeometry()

    //construct individual particle positions and colors
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    //construct the stored number of particles
    for(let i=0; i< parameters.count; i++)
    {
        //positions
        const i3 = i * 3

        const branchAngle = ((i % parameters.branches) / parameters.branches) * 2 * Math.PI
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const randomZ = Math.pow((Math.random()),parameters.randPower) * (Math.random() < 0.5 ? 1 : -1)* parameters.randomness
        const randomY = Math.pow((Math.random() * 1),parameters.randPower) * (Math.random() < 0.5 ? 1 : -1)* parameters.randomness
        const randomX = Math.pow((Math.random()),parameters.randPower) * (Math.random() < 0.5 ? 1 : -1)* parameters.randomness

        positions[i3  ] = Math.cos(branchAngle + spinAngle) * radius + randomX//X
        positions[i3+1] = randomY * 0.4 //Y
        positions[i3+2] = Math.sin(branchAngle + spinAngle) * radius + randomZ  //Z

        //colors
        const mixedColor = colorInside.clone().lerp(colorOutside,radius / parameters.radius)
        colors[i3  ] = mixedColor.r
        colors[i3+1] = mixedColor.g
        colors[i3+2] = mixedColor.b
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions,3))
    geom.setAttribute('color', new THREE.BufferAttribute(colors,3))

    /**
     * Material
     */
    material = new THREE.PointsMaterial(
        {
            size: parameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        })

    /**
     * Points
     */
    points = new THREE.Points(geom,material)
    points.rotation.x = Math.PI/24
    scene.add(points)
}

// Generate Starter Galaxy
generateGalaxy()

//GUI elements
const starSettings = gui.addFolder('Size')
starSettings.add(parameters, 'count').min(1000).max(1000000).step(100).onFinishChange(generateGalaxy).name('Number of Stars')
starSettings.add(parameters, 'size').min(0.00001).max(0.1).step(0.0001).onFinishChange(generateGalaxy).name('Star Size')
starSettings.add(parameters, 'radius',0.1,20,0.01).onFinishChange(generateGalaxy).name('Branch Size')
starSettings.add(parameters, 'branches',2,20,1).onFinishChange(generateGalaxy).name('Number of Branches')

const modifiers = gui.addFolder('Modifiers')
modifiers.add(parameters, 'spin',-5,5,0.01).onFinishChange(generateGalaxy).name('Spin')
modifiers.add(parameters, 'randomness',0.01,2,0.001).onFinishChange(generateGalaxy).name('Randomness')
modifiers.add(parameters, 'randPower',1,10,0.001).onFinishChange(generateGalaxy).name('Randomness Expon.')

const colors = gui.addFolder('Colors')
colors.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy).name('Inner Color')
colors.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy).name('Outer Color')

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
console.log(camera.zoom)
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
    const elapsedTime = clock.getElapsedTime()

    // Galaxy Rotation animation
    points.rotation.y = elapsedTime * 0.1


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()