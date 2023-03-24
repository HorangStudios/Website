let ver = "0.2.0";
console.log('HorangHill Client Version ' + ver);

//editor debug
function debug(text) {
    console.log('Message from game: ' + text)
}

// Create a scene
var scene = new THREE.Scene();

//run scripts
var runscript = 0;

//create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Create the physics world
var world = new CANNON.World();
world.gravity.set(0, -9.85, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;
const clock = new THREE.Clock();
var meshes = [];
var bodies = [];

// Create a renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xadd8e6); // Set the background color to #add8e6
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'canvas';
document.body.appendChild(renderer.domElement);

// LIGHTS
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.color.setHSL(0.1, 1, 0.95);
dirLight.position.set(- 1, 1.75, 1);
dirLight.position.multiplyScalar(30);
scene.add(dirLight);

dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

const d = 50;

dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;

dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = - 0.0001;

const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

//testing skybox
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    'resources/posx.jpg',
    'resources/negx.jpg',
    'resources/posy.jpg',
    'resources/negy.jpg',
    'resources/posz.jpg',
    'resources/negz.jpg',
]);
scene.background = texture;

// Add OrbitControls
var controls = new THREE.OrbitControls(camera, renderer.domElement);

// Function to import a GLTF file to the scene
function loadMap(contents) {
    const json = (contents);
    scene.children = importJSON(json).children;
}

function importJSON(jsonString) {
    const loader = new THREE.ObjectLoader();
    const scene = loader.parse(jsonString);

    scene.traverse((mesh) => {
        if (mesh.userData && mesh.userData.script) {
            const functionBody = mesh.userData.script.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1];
            const scriptFunction = new Function("mesh", functionBody);
            mesh.userData.scriptFunction = scriptFunction;
        }

        if (mesh.userData && mesh.userData.clickscript) {
            const functionBody = mesh.userData.clickscript.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1];
            const clickscriptfunction = new Function("mesh", functionBody);
            mesh.userData.clickscriptfunction = clickscriptfunction;
        }

        if (mesh.userData && mesh.userData.initscript) {
            const functionBody = mesh.userData.initscript.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1];
            const initscriptfunction = new Function("mesh", functionBody);
            mesh.userData.initscriptfunction = initscriptfunction;
        }

        if (mesh instanceof THREE.Mesh) {
            try {
                const shape = new CANNON.Box(new CANNON.Vec3(mesh.scale.x / 2, mesh.scale.y / 2, mesh.scale.z / 2));
                const body = new CANNON.Body({ mass: 1 });
                body.addShape(shape);
                body.position.copy(mesh.position);
                body.quaternion.copy(mesh.quaternion);

                // Add the body to the Cannon.js world
                world.addBody(body);
                bodies.push(body)
                meshes.push(mesh)
            } catch (error) {
                debug("[ERR] " + error.message);
            }

            if (mesh.userData.initscriptfunction) {
                try {
                    mesh.userData.initscriptfunction(mesh);
                }
                catch (err) {
                    debug("[ERR] " + err.message);
                }
            }
        }
    });

    return scene;
}

// Render the scene
function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {

    world.step(1 / 60);

    // update Three.js scene
    meshes.forEach((mesh, i) => {
        const body = bodies[i];
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
    });

    scene.traverse(function (object) {
        if (object instanceof THREE.Mesh && object.userData.scriptFunction) {
            try {
                object.userData.scriptFunction(object);
            }
            catch (err) {
                debug("[ERR] " + err.message);
            }
        }
    });

    controls.update()

    renderer.render(scene, camera);
}

animate()

function toggleSideBar() {
    var x = document.getElementById("Sidenav");
    var y = document.getElementById("canvas");
    if (x.style.width == "0px") {
        x.style.width = "250px";
        y.style.filter = "blur(10px)";
    } else {
        x.style.width = "0px";
        y.style.filter = "blur(0px)";
    }
}

document.getElementById('canvas').addEventListener('click', onDocumentMouseDown, false);

function onDocumentMouseDown(event) {

    // Get the mouse position relative to the canvas
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    // Create a new raycaster
    var raycaster = new THREE.Raycaster();

    // Set the origin and direction of the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Get an array of objects that the ray intersects with
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        // Get the first intersected object
        var selectedObject = intersects[0].object;

        if (selectedObject.userData.clickscriptfunction) {
            try {
                selectedObject.userData.clickscriptfunction(selectedObject);
            }
            catch (err) {
                debug("[ERR] " + err.message);
            }
        }
    }
}