// avatar preview in avatar tab
async function setAvatarPreview(avatarData) {
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  scene.add(dirLight);
  scene.add(light);
  scene.add(hemiLight);
  scene.add(sky);

  let avatarData2 = {}
  let avatarKeys = Object.keys(avatarData);

  for (let i = 0; i < avatarKeys.length; i++) {
    const avatarkey = avatarKeys[i];
    const avatarvalue = avatarData[avatarkey];
    if (avatarkey == "colors") {
      avatarData2["colors"] = avatarData.colors;
    } else {
      if (avatarvalue === false) {
        avatarData2[avatarkey] = false;
      } else {
        avatarData2[avatarkey] = (await firebaseFetch(`catalog/${avatarvalue}`)).asset;
      }
    }
  }

  var createPlayer = await playerModel(0x800000, avatarData2)
  scene.add(createPlayer[0])

  controls.target.copy(createPlayer[0].position);
  controls.update();
  createPlayer[0].position.y -= 1;
  camera.position.set(0.05475227571965991, 1.6306183051229506, -2.7743932860393827);
  camera.rotation.set(-2.8109962781697724, 0.020066732838869047, 3.134706495521198);
  controls.update();
};

// player avatar picture in players tab
async function generateAvatarPicture(avatarData) {
  var previewScene = new THREE.Scene();
  var previewCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 700);
  previewScene.add(dirLight.clone());
  previewScene.add(light.clone());
  previewScene.add(hemiLight.clone());
  previewScene.add(sky.clone());

  let previewAvatar = {};
  let avatarKeys = Object.keys(avatarData);

  for (let i = 0; i < avatarKeys.length; i++) {
    const avatarkey = avatarKeys[i];
    const avatarvalue = avatarData[avatarkey];
    if (avatarkey == "colors") {
      previewAvatar["colors"] = avatarData.colors;
    } else {
      if (avatarvalue === false) {
        previewAvatar[avatarkey] = false;
      } else {
        previewAvatar[avatarkey] = (await firebaseFetch(`catalog/${avatarvalue}`)).asset;
      }
    }
  }

  let createPlayer = await playerModel(0x800000, previewAvatar);
  previewScene.add(createPlayer[0]);
  previewCamera.position.set(0.05475227571965991, 1.6306183051229506, -1.7743932860393827);
  previewCamera.rotation.set(-2.8109962781697724, 0.020066732838869047, 3.134706495521198);

  return new Promise((resolve) => {
    setTimeout(() => {
      previewRenderer.render(previewScene, previewCamera);
      resolve(previewRenderer.domElement.toDataURL());
    }, 1000);
  });
}

// ----------------------------------------------------------------------------------------------------------------------------

// renderer for generateAvatarPicture()
var previewRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
previewRenderer.setSize(256, 256);
previewRenderer.setPixelRatio(window.devicePixelRatio);
previewRenderer.outputEncoding = THREE.sRGBEncoding;
previewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
previewRenderer.toneMappingExposure = 0.5;
previewRenderer.shadowMap.enabled = true;
previewRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ----------------------------------------------------------------------------------------------------------------------------

// player avatar preview renderer
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, 200 / 300, 0.1, 700);
var renderer = new THREE.WebGLRenderer({ antialias: true });
var controls = new THREE.OrbitControls(camera, renderer.domElement);

document.getElementById("canvascontainer").prepend(renderer.domElement)
renderer.setSize(200, 300);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.color.setHSL(0.1, 1, 0.95);
dirLight.position.set(0, 1.75, -1.75);
dirLight.position.multiplyScalar(30);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = - 50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = - 50;
dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = - 0.00001;

const sky = new THREE.Sky();
sky.scale.setScalar(450000);
const phi = THREE.MathUtils.degToRad(90);
const theta = THREE.MathUtils.degToRad(180);
const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
sky.material.uniforms.sunPosition.value = sunPosition;
const light = new THREE.AmbientLight(0x404040);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 50, 0);

function animate() {
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(animate);
}
animate()