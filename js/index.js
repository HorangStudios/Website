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

//clear url parameters
function clearParams() {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  redir = false;
  window.history.replaceState({}, document.title, url.toString());
}

//open respective tabs for shared links
var playerProfileRight = document.getElementById("playerProfileRight");
var playerProfileLeft = document.getElementById("playerProfileLeft");
switch (new URLSearchParams(window.location.search).keys().next().value) {
  case 'game': gameLink(new URLSearchParams(window.location.search).values().next().value); break;
  case 'player': playerLink(new URLSearchParams(window.location.search).values().next().value); break;
  case 'item': catalogLink(new URLSearchParams(window.location.search).values().next().value); break;
  default: document.getElementById("defaultOpen").click(); break;
}

// ----------------------------------------------------------------------------------------------------------------------------

var database = firebase.database();
var gamescontainer = document.getElementById('gamelist');
var playercontainer = document.getElementById('playerlist');
var catalogcontainer = document.getElementById('cataloglist');
var catalogSidebar = document.getElementById('catalogSidebar');
var inventorycontainer = document.getElementById('selector');
var redir = true;

//greeting in homescreen
let today = new Date();
let hour = today.getHours();
let greetingMessage
if (hour >= 5 && hour < 12) {
  greetingMessage = ("<i class='fa-solid fa-sun'></i> Good morning");
} else if (hour >= 12 && hour < 18) {
  greetingMessage = ("<i class='fa-regular fa-sun'></i> Good afternoon");
} else {
  greetingMessage = ("<i class='fa-solid fa-sun'></i> Good evening");
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
var games = {};
async function loadGames(query = "") {
  if (Object.keys(games).length == 0) games = await firebaseFetch('games');
  document.getElementById("searchbar").style.display = "block";
  gamescontainer.innerHTML = '';

  Object.keys(games).forEach(async function (gameId) {
    var game = games[gameId];
    var gamedetails = `<div id='gamecard1'><b>${sanitizeHtml(game.title)}</b><br><span id='publisher-${gameId}'>...</span></div>`;
    var gamename = "<br><div id='gamecard2'>" + sanitizeHtml(truncate(game.desc, 100)) + "</div>";
    var card = document.createElement('div');

    card.id = 'game';
    card.innerHTML = gamedetails + gamename;
    card.style.backgroundImage = `url(${game.thumbnail})`;
    card.onclick = () => { openGame(game, gameId) };

    if (game.title.toLowerCase().includes(query.toLowerCase()) || game.desc.toLowerCase().includes(query.toLowerCase())) {
      gamescontainer.prepend(card);
      firebaseFetch('/players/' + game.uid).then((data) => { try { document.getElementById(`publisher-${gameId}`).innerText = data.displayName } catch (e) { } });
    };
  });
}
loadGames();

// load players
var players = {}, playerthumbnails = {};
async function loadPlayers(query = "") {
  if (Object.keys(players).length == 0) players = await firebaseFetch('players');
  document.getElementById("playersearchbar").style.display = "block";
  playercontainer.innerHTML = '';

  Object.keys(players).forEach(async function (playerId) {
    var player = players[playerId];
    var gamedetails = "<div id='gamecard1'><b>" + sanitizeHtml(player.displayName) + "</b><br></div>";
    var gamename = "<div id='gamecard2'>" + sanitizeHtml(truncate(player.bio, 100)) + "</div>"

    var card = document.createElement('div');
    card.id = 'game';
    card.innerHTML = gamedetails + gamename;
    card.onclick = async () => { openProfile(player, playerId) }

    if (player.displayName.toLowerCase().includes(query.toLowerCase()) || playerId.toLowerCase().includes(query.toLowerCase())) {
      playercontainer.prepend(card);
      if (playerthumbnails[playerId]) { card.style.backgroundImage = `url(${playerthumbnails[playerId]})`; }
      else { playerthumbnails[playerId] = await generateAvatarPicture(player.avatar, false, true); card.style.backgroundImage = `url(${playerthumbnails[playerId]})` }
    }
  });
}
loadPlayers();

// load catalog
async function loadCatalog() {
  let items = await firebaseFetch('catalog');;
  catalogcontainer.innerHTML = ''
  catalogSidebar.innerHTML = ''

  Object.keys(items).forEach(async function (itemId) {
    var item = items[itemId];
    var avatarData = {};
    var priceString = (item.price == 0) ? 'Free' : (item.price + ' Bits');

    try {
      avatarData["colors"] = (await firebaseFetch(`players/${firebase.auth().currentUser.uid}/avatar/colors`));
      avatarData[item.type] = item.asset;
      item.asset = await generateAvatarPicture(avatarData, true, false)
    } catch (error) { }

    var card = document.createElement('div');
    card.onclick = () => { catalogView(item, itemId) };
    card.className = 'catalogItem';
    card.innerHTML = `
      <img src="${sanitizeHtml(item.asset)}"><br>
      <b>${sanitizeHtml(item.name)}</b><br>
      ${sanitizeHtml(item.type.charAt(0).toUpperCase() + item.type.slice(1))} - ${sanitizeHtml(priceString)}
    `

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
        Object.values(document.getElementsByClassName("catalogitemcategory")).forEach((item) => { item.style.display = 'none' })
        createcategory.style.display = 'block'
      }

      if (item.type == 'shirt') {
        createcategory.style.display = 'block'
        createcategoryinput.checked = true
      } else {
        createcategory.style.display = 'none'
      }

      if (item.moderated || item.uid == firebase.auth().currentUser.uid) createcategory.appendChild(card);
    }
  });
}
loadCatalog();

// ----------------------------------------------------------------------------------------------------------------------------

//checkbook system
var calculatedBits = 0;
var avatarCache = {};
function userCheckLoop() {
  database.ref(`players/${firebase.auth().currentUser.uid}/login`).set(firebase.auth().currentUser.metadata.lastSignInTime);
  database.ref(`players/${firebase.auth().currentUser.uid}`).on('value', async function (snapshot) {
    var items = snapshot.val();
    var inventoryObj = items.checkbook || {};
    var bits = 100;
    var inventory = [];

    for (let i = 0; i < Object.keys(inventoryObj).length; i++) {
      const item = Object.values(inventoryObj)[i];
      switch (item.type) {
        case "catalogPurchase":
          const catalogItem = avatarCache[item.product] ??= await firebaseFetch(`catalog/${item.product}`);
          if ((bits - catalogItem.price) < 0) { database.ref(`players/${firebase.auth().currentUser.uid}/checkbook/${key}`).remove(); break; }
          bits -= catalogItem.price
          inventory.push(item.product);
          break;
        case "loginBonus":
          bits += 10;
          break;
        case "purchaseBits":
          bits += item.val;
          break;
      }
    }

    calculatedBits = bits;
    setAvatarPreview(items.avatar, true);
    procInventory(inventory, items.avatar.colors);

    const bitsSpentElem = document.getElementById("myBits");
    if (bitsSpentElem) bitsSpentElem.innerText = bits;
  })
}

// avatar loader
function procInventory(items, skinCLR) {
  inventorycontainer.innerHTML = '';

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
      var itemdata = avatarCache[itemObj] ??= await firebaseFetch(`catalog/${itemObj}`);
      var card = document.createElement('div');
      card.className = 'catalogItem';
      card.innerHTML = `
        <img src="${sanitizeHtml(itemdata.asset)}"><br>
        <b title="${sanitizeHtml(itemObj)}">${sanitizeHtml(itemdata.name)}</b><br>
        By ${sanitizeHtml((await firebaseFetch('/players/' + itemdata.uid)).displayName)}
      `

      card.onclick = () => {
        firebase.database().ref(`players/${firebase.auth().currentUser.uid}/avatar/${itemdata.type}`).set(parseInt(itemObj))
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
        categoryElem.append(card)

        unapplyButton.onclick = () => {
          firebase.database().ref(`players/${firebase.auth().currentUser.uid}/avatar/${itemdata.type}`).set(false)
        }

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

// ----------------------------------------------------------------------------------------------------------------------------

// change display name
function updateDisplayName() {
  try {
    firebase.auth().currentUser.updateProfile({ displayName: document.getElementById('displayName').value });
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