function openTab(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  if (cityName != 'Details') {
    document.getElementById("sidebar").style.background = "rgba(0, 0, 0, .20) url('../css/horanghillstartingplace.png')";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

// ----------------------------------------------------------------------------------------------------------------------------

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDE-mQcJoquJxLrHAcS1kZbpjUbHYQmzsE",
  authDomain: "horanghill.firebaseapp.com",
  databaseURL: "https://horanghill-default-rtdb.firebaseio.com",
  projectId: "horanghill",
  storageBucket: "horanghill.appspot.com",
  messagingSenderId: "710235265347",
  appId: "1:710235265347:web:37fb53fe0bb9c4ecdab7f6",
  measurementId: "G-S1JMDFPGL0"
};
firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var gamescontainer = document.getElementById('gamelist');
var catalogcontainer = document.getElementById('cataloglist');
var inventorycontainer = document.getElementById('selector');

//greetings time
let today = new Date();
let hour = today.getHours();
let greetings
if (hour >= 5 && hour < 12) {
  greetings = ("<i class='fa-solid fa-sun'></i> Good morning");
} else if (hour >= 12 && hour < 18) {
  greetings = ("<i class='fa-regular fa-sun'></i> Good afternoon");
} else {
  greetings = ("<i class='fa-solid fa-sun'></i> Good evening");
}
document.getElementById('greetings').innerHTML = `${greetings}, Player!`

function truncate(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

database.ref('games').on('value', function (snapshot) {
  document.getElementById('main').style.display = "block"
  gamescontainer.innerHTML = '';
  var displayName = firebase.auth().currentUser.displayName || "Player";
  document.getElementById('greetings').innerHTML = `${greetings}, ${sanitizeHtml(displayName)}!`

  let games = snapshot.val();

  Object.keys(games).forEach(function (gameId) {
    var game = games[gameId];

    var card = document.createElement('div');
    card.id = 'game';
    gamedetails = "<div id='gamecard1'><h2>" + sanitizeHtml(game.title) + "</h2>" + sanitizeHtml(game.createdBy) + "</div>";
    gamename = "<br><div id='gamecard2'>" + sanitizeHtml(truncate(game.desc, 100)) + "</div>"
    card.innerHTML = gamedetails + gamename;
    card.style.backgroundImage = "url(" + game.thumbnail + ")";
    card.onclick = function () {
      document.getElementById('gameTitle').innerText = game.title;
      document.getElementById('gamePublisher').innerText = game.createdBy;
      document.getElementById('gameDescription').innerText = game.desc;
      document.getElementById("sidebar").style.background = "rgba(0, 0, 0, .20) url(" + game.thumbnail + ")";
      document.getElementById("gamedetailstabtogglebutton").click();

      document.getElementById("playButton").onclick = function () {
        window.location.href = ("https://horangstudios.github.io/LigmaForge/player/?id=" + gameId + "&online=true")
      };

      if (game.uid == firebase.auth().currentUser.uid) {
        document.getElementById('editButton').removeAttribute("hidden");
        document.getElementById("editButton").onclick = function () {
          window.location.href = ("details.html?id=" + gameId);
        };
      } else {
        document.getElementById('editButton').setAttribute("hidden", "")
      }
    }

    gamescontainer.prepend(card);
  });
});

database.ref('catalog').on('value', function (snapshot) {
  let items = snapshot.val();
  catalogcontainer.innerHTML = ''

  Object.keys(items).forEach(function (itemId) {
    var item = items[itemId];
    var priceString

    if (item.price == 0) {
      priceString = 'Free'
    } else {
      priceString = item.price + ' Bits'
    }

    var card = document.createElement('div');
    card.className = 'catalogItem';
    card.innerHTML = `
      <img src="${sanitizeHtml(item.asset)}"><br>
      <b>${sanitizeHtml(item.name)}</b><br>
      ${sanitizeHtml(item.type.charAt(0).toUpperCase() + item.type.slice(1))} - ${sanitizeHtml(priceString)}
    `

    card.onclick = async function () {
      document.getElementById('itemTitle').innerText = item.name;
      document.getElementById('itemDesc').innerText = item.description || "No Description";
      document.getElementById('itemPublisher').innerText = 'By ' + (await firebaseFetch('/players/' + item.uid)).displayName;
      document.getElementById("itemdetailbutton").click();
      document.getElementById("itemImage").src = item.asset;
      document.getElementById("buyButton").innerText = priceString;

      document.getElementById("buyButton").onclick = async function () {
        if (item.price <= (await firebaseFetch('/players/' + firebase.auth().currentUser.uid)).bits) {
          const currentUser = firebase.auth().currentUser;
          const playerData = await firebaseFetch('/players/' + currentUser.uid);

          if (playerData.inventory && Object.values(playerData.inventory).includes(parseInt(itemId))) {
            document.getElementById("buyButton").innerText = "You already have it!"
          } else {
            const inventory = (await firebaseFetch('/players/' + item.uid)).inventory || {};
            firebase.database().ref(`players/${firebase.auth().currentUser.uid}/inventory/${inventory.length || 0}`).set(parseInt(itemId))
            firebase.database().ref(`players/${firebase.auth().currentUser.uid}/bits`).set(parseInt((await firebaseFetch('/players/' + firebase.auth().currentUser.uid)).bits - item.price))
            document.getElementById("buyButton").innerText = "Bought!"
          }
        } else {
          document.getElementById("buyButton").innerText = "Not enough Bits!"
        }
      };
    }

    if (!item.moderated && item.uid != firebase.auth().currentUser.uid) return;
    catalogcontainer.prepend(card);
  });
});

function userCheckLoop() {
  database.ref(`players/${firebase.auth().currentUser.uid}`).on('value', function (snapshot) {
    let items = snapshot.val();

    setAvatarPreview(items.avatar);
    procInventory(items.inventory, items.avatar.colors);
    procBalance();
  })
}

function procBalance() {
  database.ref(`players/${firebase.auth().currentUser.uid}/bits`).once('value', function (snapshot) {
    let val = snapshot.val();
    document.getElementById("myBits").innerText = val;
  });
}

function procInventory(items, skinCLR) {
  inventorycontainer.innerHTML = ''

  Object.keys(skinCLR).forEach(async element => {
    document.getElementById(element + "Input").value = `#${skinCLR[element].toString(16)}`
    document.getElementById(element + "Input").onchange = function (e) {
      firebase.database().ref(`players/${firebase.auth().currentUser.uid}/avatar/colors/${element}`).set(parseInt(document.getElementById(element + "Input").value.replace("#", "0x")))
    }
  });

  Object.keys(items).forEach(async key => {
    var item = items[key]
    var itemdata = await firebaseFetch(`catalog/${item}`)

    var card = document.createElement('div');
    card.className = 'catalogItem';
    card.innerHTML = `
      <img src="${sanitizeHtml(itemdata.asset)}"><br>
      <b>${sanitizeHtml(itemdata.name)}</b><br>
      By ${sanitizeHtml((await firebaseFetch('/players/' + itemdata.uid)).displayName)}
    `

    card.onclick = () => {
      firebase.database().ref(`players/${firebase.auth().currentUser.uid}/avatar/${itemdata.type}`).set(parseInt(key))
    }

    if (!itemdata.moderated && itemdata.uid != firebase.auth().currentUser.uid) return;

    if (document.getElementById(itemdata.type + "-avatar-inventory-category")) {
      document.getElementById(itemdata.type + "-avatar-inventory-category").append(card)
    } else {
      var categoryElem = document.createElement('div')
      categoryElem.id = itemdata.type + "-avatar-inventory-category"
      inventorycontainer.appendChild(categoryElem);
      inventorycontainer.appendChild(document.createElement('br'));

      var header = document.createElement("h1")
      header.innerText = itemdata.type
      header.style.textTransform = 'capitalize'
      document.getElementById(itemdata.type + "-avatar-inventory-category").append(header)

      var br = document.createElement("br")
      document.getElementById(itemdata.type + "-avatar-inventory-category").append(br)

      var unapplyButton = document.createElement("div")
      unapplyButton.className = 'catalogItem'
      unapplyButton.innerHTML = `
        <img src="../css/nouse.png"><br>
        <b>No ${sanitizeHtml(itemdata.type)}</b><br>
        Use solid color
      `
      document.getElementById(itemdata.type + "-avatar-inventory-category").append(unapplyButton)

      unapplyButton.onclick = () => {
        firebase.database().ref(`players/${firebase.auth().currentUser.uid}/avatar/${itemdata.type}`).set(false)
      }

      document.getElementById(itemdata.type + "-avatar-inventory-category").append(card)
    }
  })
}

async function setAvatarPreview(avatarData) {
  scene.remove.apply(scene, scene.child)

  scene.add(dirLight);
  scene.add(light);
  scene.add(hemiLight);
  scene.add(sky);

  var shirt = false;
  var pants = false;
  var colors = avatarData.colors || false;

  if (avatarData.shirt !== false) {
    var shirt = (await firebaseFetch(`catalog/${avatarData.shirt}`)).asset
  }

  if (avatarData.pants !== false) {
    var pants = (await firebaseFetch(`catalog/${avatarData.pants}`)).asset
  }

  var createPlayer = await playerModel(0x800000, { "shirt": shirt, "pants": pants, "colors": colors })
  scene.add(createPlayer[0])

  controls.target.copy(createPlayer[0].position);
  controls.update();
  createPlayer[0].position.y -= 1;
  camera.position.set(0.05475227571965991, 1.6306183051229506, -2.7743932860393827);
  camera.rotation.set(-2.8109962781697724, 0.020066732838869047, 3.134706495521198);
  controls.update();
}

// ----------------------------------------------------------------------------------------------------------------------------

async function firebaseFetch(dir) {
  var ref = firebase.database().ref(dir);
  const snapshot = await ref.once('value');
  return snapshot.val();
}

function updateDisplayName() {
  try {
    firebase.auth().currentUser.updateProfile({
      displayName: document.getElementById('displayName').value
    });
    firebase.database().ref(`players/${firebase.auth().currentUser.uid}/displayName`).set(document.getElementById('displayName').value)
  } catch (error) {
    alert(error.message);
  }
}

function updatePassWord() {
  try {
    firebase.auth().currentUser.updatePassword(document.getElementById('passbox').value)
      .catch((error) => {
        alert(error.message);
      });
  } catch (error) {
    alert(error.message);
  }
}

function updateMail() {
  try {
    firebase.auth().currentUser.updateEmail(document.getElementById('mailbox').value)
      .catch((error) => {
        alert(error.message);
      });
  } catch (error) {
    alert(error.message);
  }
}

// ----------------------------------------------------------------------------------------------------------------------------

var form = document.getElementById('publishForm');

var gamejson
function importScene() {
  var input = document.getElementById("file-input");
  var label = document.getElementById("hhls-label");
  const file = input.files[0];

  const reader = new FileReader();
  reader.onload = function (event) {
    const contents = event.target.result;
    const json = JSON.parse(contents);
    gamejson = json
    label.innerHTML = label.innerHTML + sanitizeHtml(` (${file.name})`)
  };

  reader.readAsText(file);
}

var imagedataurl
function importIMG() {
  var input = document.getElementById("thumbnail");
  var label = document.getElementById("thumbnail-label");
  const file = input.files[0];

  const reader = new FileReader();
  reader.onload = function (event) {
    imagedataurl = reader.result
    label.innerHTML = label.innerHTML + sanitizeHtml(` (${file.name})`)
  };

  reader.readAsDataURL(file);
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  var title = document.getElementById('title-text').value;
  var desc = document.getElementById('descbox').value;

  if (title && desc) {
    if (imagedataurl === undefined) return;
    if (gamejson === undefined) return;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    var displayName = firebase.auth().currentUser.displayName;

    var userid = firebase.auth().currentUser.uid;

    var game = {
      title: title,
      desc: desc,
      thumbnail: imagedataurl,
      createdAt: today,
      hhls: gamejson,
      createdBy: displayName,
      uid: userid
    };

    database.ref('games').push(game);

    form.reset();
  }
});

// ----------------------------------------------------------------------------------------------------------------------------

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