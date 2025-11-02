// tab system
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

document.getElementById("defaultOpen").click();

// ----------------------------------------------------------------------------------------------------------------------------

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
var playercontainer = document.getElementById('playerlist');
var catalogcontainer = document.getElementById('cataloglist');
var catalogSidebar = document.getElementById('catalogSidebar');
var inventorycontainer = document.getElementById('selector');

//greeting in homescreen
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

//shorten
function truncate(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

// load games
database.ref('games').on('value', function (snapshot) {
  let games = snapshot.val();
  gamescontainer.innerHTML = '';

  Object.keys(games).forEach(function (gameId) {
    var game = games[gameId];

    var card = document.createElement('div');
    card.id = 'game';

    gamedetails = "<div id='gamecard1'><b>" + sanitizeHtml(game.title) + "</b><br>" + sanitizeHtml(game.createdBy) + "</div>";
    gamename = "<br><div id='gamecard2'>" + sanitizeHtml(truncate(game.desc, 100)) + "</div>"

    card.innerHTML = gamedetails + gamename;
    card.style.backgroundImage = `url(${game.thumbnail})`;

    card.onclick = function () {
      document.getElementById('gameTitle').innerText = game.title;
      document.getElementById('gamePublisher').innerText = game.createdBy;
      document.getElementById('gameDescription').innerText = game.desc;
      document.getElementById("gamethumbnail").style.backgroundImage = `url(${game.thumbnail})`;
      document.getElementById("gamedetailstabtogglebutton").click();

      document.getElementById("playButton").onclick = function () {
        window.location.href = ("https://horangstudios.github.io/LigmaForge/player/?id=" + gameId + "&online=true")
      };

      if (game.uid == firebase.auth().currentUser.uid) {
        document.getElementById('editButton').removeAttribute("hidden");
        document.getElementById("editButton").onclick = function () {
          window.open(("details.html?id=" + gameId), "_blank").focus();
        };
      } else {
        document.getElementById('editButton').setAttribute("hidden", "")
      }
    }

    gamescontainer.prepend(card);
  });
});

// load players
database.ref('players').on('value', function (snapshot) {
  let players = snapshot.val();
  playercontainer.innerHTML = '';

  Object.keys(players).forEach(async function (playerId) {
    var player = players[playerId];

    var card = document.createElement('div');
    card.id = 'game';

    gamedetails = "<div id='gamecard1'><b>" + sanitizeHtml(player.displayName) + "</b><br></div>";
    gamename = "<div id='gamecard2'>" + sanitizeHtml(truncate(player.bio, 100)) + "</div>"
    card.innerHTML = gamedetails + gamename;
    card.style.backgroundImage = `url(${await generateAvatarPicture(player.avatar)})`;

    playercontainer.prepend(card);

    card.onclick = async function () {
      document.getElementById("playerProfileLeft").innerHTML = '';
      document.getElementById("playerdetailbutton").click();

      const username = document.createElement("h2");
      username.innerText = player.displayName;
      document.getElementById("playerProfileLeft").appendChild(username);

      const bio = document.createElement("span");
      bio.innerText = player.bio;
      document.getElementById("playerProfileLeft").appendChild(bio)
    }
  });
});

// load catalog
database.ref('catalog').on('value', function (snapshot) {
  let items = snapshot.val();
  catalogcontainer.innerHTML = ''
  catalogSidebar.innerHTML = ''

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
        if (item.price <= calculatedBits) {
          const currentUser = firebase.auth().currentUser;
          const playerData = await firebaseFetch('/players/' + currentUser.uid);

          if (playerData.checkbook && Object.values(playerData.checkbook).some(entry => entry.product === parseInt(itemId))) {
            document.getElementById("buyButton").innerText = "You already have it!"
          } else {
            firebase.database().ref(`players/${firebase.auth().currentUser.uid}/checkbook/${Date.now()}`).set({
              type: "catalogPurchase",
              product: parseInt(itemId)
            })
            document.getElementById("buyButton").innerText = "Bought!"
          }
        } else {
          document.getElementById("buyButton").innerText = "Not enough Bits!"
        }
      };
    }

    if (document.getElementById(item.type + "-avatar-catalog-category")) {
      if (!item.moderated && item.uid != firebase.auth().currentUser.uid) return;
      document.getElementById(item.type + "-avatar-catalog-category").appendChild(card)
    } else {
      var createcategory = document.createElement("div")
      createcategory.id = item.type + "-avatar-catalog-category"
      createcategory.className = 'catalogitemcategory'
      document.getElementById("cataloglist").appendChild(createcategory)

      var label = document.createElement('label')
      label.innerText = item.type
      label.style.textTransform = 'capitalize'
      document.getElementById("catalogSidebar").appendChild(label)

      var createcategoryinput = document.createElement("input")
      createcategoryinput.type = 'radio'
      createcategoryinput.name = 'category-selector'
      createcategoryinput.id = item.type + "-avatar-catalog-category-input"
      label.prepend(createcategoryinput)

      createcategoryinput.onchange = function () {
        Object.values(document.getElementsByClassName("catalogitemcategory")).forEach((item) => {
          item.style.display = 'none'
        })
        createcategory.style.display = 'block'
      }

      if (item.type == 'shirt') {
        createcategory.style.display = 'block'
        createcategoryinput.checked = true
      } else {
        createcategory.style.display = 'none'
      }

      if (!item.moderated && item.uid != firebase.auth().currentUser.uid) return;
      createcategory.appendChild(card)
    }
  });
});

//checkbook system
var calculatedBits = 0;
function userCheckLoop() {
  database.ref(`players/${firebase.auth().currentUser.uid}`).on('value', async function (snapshot) {
    const items = snapshot.val();
    const inventoryObj = items.checkbook || {};
    const bitsSpentElem = document.getElementById("myBits")

    var bits = 100;
    var inventory = [];

    if (Object.keys(inventoryObj).length == 0) {
      setAvatarPreview(items.avatar);
      procInventory(inventory, items.avatar.colors);

      calculatedBits = bits
      if (bitsSpentElem) {
        bitsSpentElem.innerText = bits;
      };
    } else {
      Object.keys(inventoryObj).forEach(async (key, i) => {
        const item = inventoryObj[key]
        switch (item.type) {
          case "catalogPurchase":
            const catalogItem = await firebaseFetch(`catalog/${item.product}`);
            if ((bits - catalogItem.price) < 0) {
              firebase.database().ref(`players/${firebase.auth().currentUser.uid}/checkbook/${key}`).remove();
            } else {
              bits -= catalogItem.price
              inventory.push(item.product);
            }
            break;
          case "loginBonus":
            bits += 10;
            break;
          case "purchaseBits":
            bits += item.val;
            break;
        }

        if (i == (Object.keys(inventoryObj).length - 1)) {
          setAvatarPreview(items.avatar);
          procInventory(inventory, items.avatar.colors);

          calculatedBits = bits
          if (bitsSpentElem) {
            bitsSpentElem.innerText = bits;
          };
        }
      })
    }
  })
}

// avatar loader
function procInventory(items, skinCLR) {
  inventorycontainer.innerHTML = ''

  Object.keys(skinCLR).forEach(async element => {
    document.getElementById(element + "Input").value = skinCLR[element];
    document.getElementById(element + "Input").onchange = function (e) {
      firebase.database().ref(`players/${firebase.auth().currentUser.uid}/avatar/colors/${element}`).set(document.getElementById(element + "Input").value)
    }
  });

  if (items.length == 0) {
    inventorycontainer.innerHTML = '<h1>Empty!</h1><br>You have nothing inside your inventory. Start by exploring the catalog.'
  } else {
    items.forEach(async (itemObj, key) => {
      var itemdata = await firebaseFetch(`catalog/${itemObj}`)

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
        categoryElem.append(header)

        var br = document.createElement("br")
        categoryElem.append(br)

        var unapplyButton = document.createElement("div")
        unapplyButton.className = 'catalogItem'
        unapplyButton.innerHTML = `
        <img src="../css/none.png"><br>
        <b>No ${sanitizeHtml(itemdata.type)}</b><br>
        Use solid color
      `
        categoryElem.append(unapplyButton)

        unapplyButton.onclick = () => {
          firebase.database().ref(`players/${firebase.auth().currentUser.uid}/avatar/${itemdata.type}`).set(false)
        }

        categoryElem.append(card)
      }
    })
  }
}

//create tab selector
function updateCreate() {
  const createorsubmit = document.getElementById("createorsubmit")
  const creationtype = document.getElementById("creationtype")

  Object.values(document.getElementsByClassName('createmenuts')).forEach((item) => {
    item.style.display = 'none'
  })

  document.getElementById(`${createorsubmit.value}-${creationtype.value}`).style.display = 'block'
}

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
  previewCamera.position.set(0.05475227571965991, 1.6306183051229506, -2.7743932860393827);
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

// fetch from firebase
async function firebaseFetch(dir) {
  var ref = firebase.database().ref(dir);
  const snapshot = await ref.once('value');
  return snapshot.val();
}

// change display name
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

// change password
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

// change email
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
var shirtform = document.getElementById('shirtPublishForm');
var pantsform = document.getElementById('pantsPublishForm');

// hhls file input
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

//game thumbnail file input
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

// shirt file input
var shirtdataurl
function importShirt() {
  var input = document.getElementById("shirtimg");
  var label = document.getElementById("shirtimg-label");
  const file = input.files[0];

  const reader = new FileReader();
  reader.onload = function (event) {
    shirtdataurl = reader.result;
    label.innerHTML = label.innerHTML + sanitizeHtml(` (${file.name})`)
  };

  reader.readAsDataURL(file);
}

// pants file input
var pantsdataurl
function importPants() {
  var input = document.getElementById("pantsimg");
  var label = document.getElementById("pantsimg-label");
  const file = input.files[0];

  const reader = new FileReader();
  reader.onload = function (event) {
    pantsdataurl = reader.result;
    label.innerHTML = label.innerHTML + sanitizeHtml(` (${file.name})`)
  };

  reader.readAsDataURL(file);
}

// game submit
form.addEventListener('submit', function (event) {
  event.preventDefault();
  form.style.display = 'none';

  var title = document.getElementById('title-text').value;
  var desc = document.getElementById('descbox').value;

  if (title && desc) {
    if (imagedataurl === undefined) return;
    if (gamejson === undefined) return;

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const displayName = firebase.auth().currentUser.displayName;
    const userid = firebase.auth().currentUser.uid;
    const storageRef = database.ref('storage').push({ file: gamejson, uid: userid });

    const game = {
      title: title,
      desc: desc,
      thumbnail: imagedataurl,
      createdAt: mm + '/' + dd + '/' + yyyy,
      hhls: storageRef.key,
      createdBy: displayName,
      uid: userid
    };

    database.ref('games').push(game);
    form.reset();
    form.style.display = 'block';

    document.getElementById("thumbnail-label").innerHTML = '<i class="fa-solid fa-upload"></i> <b>Game thumbnail</b>';
    document.getElementById("hhls-label").innerHTML = '<i class="fa-solid fa-upload"></i> <b>HHLS file</b>';
    openTab(event, 'Home');
  }
});

//shirt submit
shirtform.addEventListener('submit', async function (event) {
  event.preventDefault();
  shirtform.style.display = 'none';

  var name = document.getElementById('name-shirt').value;
  var price = document.getElementById('price-shirt').value;

  if (name && price && typeof shirtdataurl !== undefined) {
    firebase.database().ref('catalog/').once('value')
      .then(function (snapshot) {
        var shirt = {
          name: name,
          price: price,
          asset: shirtdataurl,
          type: 'shirt',
          moderated: false,
          uid: firebase.auth().currentUser.uid
        };

        database.ref(`catalog/${Object.keys(snapshot.val()).length}`).set(shirt);
        shirtform.style.display = 'block';
        shirtform.reset();

        document.getElementById("shirtimg-label").innerHTML = '<i class="fa-solid fa-upload"></i> <b>Shirt Image</b>';
        openTab(event, 'Catalog');
      });
  }
});

// pants submit
pantsform.addEventListener('submit', function (event) {
  event.preventDefault();
  pantsform.style.display = 'none';
  
  var name = document.getElementById('name-pants').value;
  var price = document.getElementById('price-pants').value;

  if (name && price && typeof pantsdataurl !== undefined) {
    firebase.database().ref('catalog/').once('value')
      .then(function (snapshot) {
        var pants = {
          name: name,
          price: price,
          asset: pantsdataurl,
          type: 'pants',
          moderated: false,
          uid: firebase.auth().currentUser.uid
        };

        database.ref(`catalog/${Object.keys(snapshot.val()).length}`).set(pants);
        pantsform.style.display = 'block';
        pantsform.reset();

        document.getElementById("pantsimg-label").innerHTML = '<i class="fa-solid fa-upload"></i> <b>Pants Image</b>';
        openTab(event, 'Catalog');
      });
  }
});

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