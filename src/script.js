import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
import {CannonDebugRenderer} from './CannonDebugRenderer.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Base
*/
const gui = new dat.GUI()
const debugObject = {}


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Physics
*/
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true

world.gravity.set(0,- 200, 0)

 
/**
  * Textures
*  */
const textureLoader = new THREE.TextureLoader()
const heartMatCap = textureLoader.load('/textures/MatCap.jpg')

 
// Default material
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0.9,
        restitution: 0.3
      }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial
world.defaultContactMaterial.contactEquationStiffness = 1e8;
world.defaultContactMaterial.contactEquationRegularizationTime = 3;


/**
 * Utils
*/
const objectsToUpdate = []
const Hearts = []
const redHearts = []

/**
 * MODELS
*/

      
/**
 * Baloons
*/

const fbxloader = new FBXLoader();
const gltfLoader = new GLTFLoader()

gltfLoader.load( 'models/pillows.glb', function ( model ) {
 
    
    model.scene.traverse( function ( child ) {

       if ( child.isMesh ) {
            
   
            child.castShadow = true;
            child.receiveShadow = true;
           
        }
          
    });
    
    


//Random number
function randomNumber(min, max) { 
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
}  
const n = randomNumber(1, 10)


//Random Color
function generateLightColorHex() {
    let color = "#";
    for (let i = 0; i < 3; i++)
      color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
    return color;
}
 

//Create mesh
const mesh = model.scene.children[n]
mesh.scale.set(0.5, 0.5, 0.5)


/**
* Scene
*/
fbxloader.load( 'models/EVR_FF_Location_v01 (2).fbx', function ( object ) {
 
 
    object.traverse( function ( child ) {
 
         if ( child.isMesh ) {
 
             child.castShadow = true;
             child.receiveShadow = true;
 
         }
 
    } );
 
    scene.add( object );
 
} );
 

/**
 * Debug
*/
debugObject.createPillow = () =>
{
    for ( var i = 0; i < 15; i ++ ){
     createPillow(
        0.5,
        0.5,
        0.5,
         {
             x: (Math.random() - 1.5) * 150,
             y: 450,
             z: 180 - (Math.random() - 0.5) * 5
         }
     )}
}
 
gui.add(debugObject, 'createPillow')

 
//Create Pillow
const createPillow = (width, height, depth, position) =>
{
    // Three.js mesh
    
    const pillowMaterial = new THREE.MeshPhongMaterial({
        color: generateLightColorHex(), 
        flatShading: false,
        shininess: 80
    })

    //Random number
    function randomNumber(min, max) { 
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
    } 
    const n = randomNumber(0, 10)

    const pillow = new THREE.Mesh(model.scene.children[n].geometry, pillowMaterial)
    const boundingBox = new THREE.Box3().setFromObject(pillow)

    const xSize = boundingBox.max.x - boundingBox.min.x
    const ySize = boundingBox.max.y - boundingBox.min.y
    const zSize = boundingBox.max.z - boundingBox.min.z
            
    pillow.castShadow = true
    pillow.scale.set(width , height , depth)
    pillow.position.copy(position)
   
    scene.add(pillow)
    
 
    const shape = new CANNON.Box(new CANNON.Vec3(width * xSize * 0.5, height * ySize * 0.5, depth * zSize * 0.5))
    const body = new CANNON.Body({
        mass: 9999,
        position: new CANNON.Vec3(0, 0, 0 ),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    body.applyForce(new CANNON.Vec3( 0, 0, - 3), new CANNON.Vec3( 30, 0, 10))
    
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ pillow, body })
}


//HEART

debugObject.createHeart = () =>
{
    for ( var i = 0; i < 4; i ++ ){
     createHeart(
        0.2,
        0.2,
        0.2,
         {
             x: 200 + (Math.random() - 0.5) * 50,
             y: 50 + (Math.random() - 0.5) * 30,
             z: 200 + (Math.random() - 0.5) * 50
         }
     ) }
}
 
gui.add(debugObject, 'createHeart')


     
//Create Heart Pillow
const createHeart = (width, height, depth, position) =>
{
    // Three.js mesh

    
    const heartMaterial = new THREE.MeshPhongMaterial({
        color: 'pink', 
        //map: heartMatCap,
        flatShading: false,
        shininess: 80
    })
    
    const heart = new THREE.Mesh(model.scene.children[4].geometry, heartMaterial)
    heart.rotation.x = Math.PI / 2;
    
    const boundingBox = new THREE.Box3().setFromObject(heart)

    const xSize = boundingBox.max.x - boundingBox.min.x
    const ySize = boundingBox.max.y - boundingBox.min.y
    const zSize = boundingBox.max.z - boundingBox.min.z
            
    heart.castShadow = true
    heart.scale.set(width , height , depth)
    heart.position.copy(position)
    
    scene.add(heart)
    
 
    const heartshape = new CANNON.Box(new CANNON.Vec3(width * xSize * 0.5, height * zSize * 0.4, depth * ySize * 0.4))
    const heartbody = new CANNON.Body({
        mass: 1.2,
        position: new CANNON.Vec3(0, 0, 0 ),
        shape: heartshape,
        material: defaultMaterial
    })
    heartbody.position.copy(position)
    heartbody.quaternion.copy( heart.quaternion )
    //heartbody.applyForce(new CANNON.Vec3( 0, 0, - 3), new CANNON.Vec3( 30, 0, 10))
        
    world.addBody(heartbody)
    // Save in objects
    Hearts.push({ heart, heartbody })        
}



// Reset
debugObject.Pillows_Off = () =>
{
     for(const object of objectsToUpdate)
     {
         // Remove body
        
         world.removeBody(object.body)
 
         // Remove mesh
         scene.remove(object.pillow)
     }

}
gui.add(debugObject, 'Pillows_Off')

debugObject.Hearts_Off = () =>
{
    for( const object of Hearts)
    {
         // Remove body
        
         world.removeBody(object.heartbody)
 
         // Remove mesh
         scene.remove(object.heart)
    }
}
gui.add(debugObject, 'Hearts_Off')


/**
 * Floor
*/
const floorShape = new CANNON.Box(new CANNON.Vec3(900, 505, 0.5))
const floorBody = new CANNON.Body()
floorBody.position.y = -8
floorBody.mass = 0
floorBody.material = defaultMaterial
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 
world.addBody(floorBody)

const floor = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1000, 1010, 1),
    new THREE.MeshStandardMaterial({
        color: 'red'       
    })
)
floor.position.copy(floorBody.position)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
//scene.add(floor)


const floorShape2 = new CANNON.Box(new CANNON.Vec3(900, 230, 6))
const floorBody2 = new CANNON.Body()
floorBody2.position.y = - 4.5
floorBody2.mass = 0
floorBody2.material = defaultMaterial
floorBody2.addShape(floorShape2)
floorBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 
world.addBody(floorBody2)

const floor2 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1000, 460, 12),
    new THREE.MeshStandardMaterial({
        color: 'blue'       
    })
)
floor2.position.copy(floorBody2.position)
floor2.receiveShadow = true
floor2.rotation.x = - Math.PI * 0.5
//scene.add(floor2)


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
const camera = new THREE.PerspectiveCamera(85, sizes.width / sizes.height, 0.1, 10000)
camera.position.set(0, 50, 500)
camera.lookAt(new THREE.Vector3(0, 450, 0))
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world)


/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

//console.log(scene)



const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update physics
    world.step(1 / 60, deltaTime, 3)
      
    
    for(const object of objectsToUpdate)
    {
        object.pillow.position.copy(object.body.position)
        object.pillow.quaternion.copy(object.body.quaternion)
    }

    for( const object of Hearts)
    {
        object.heart.position.copy(object.heartbody.position)
        object.heart.quaternion.copy(object.heartbody.quaternion)

        object.heartbody.position.y += 6

        if(object.heartbody.position.y > 320){
            // Remove body
            world.removeBody(object.heartbody)
    
            // Remove mesh
            scene.remove(object.heart)
        }
    }

    
   

    // Update controls
    controls.update()
    // cannonDebugRenderer.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

} 
);
