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
async function loadGames() {
  let games = await firebaseFetch('games');
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
}
loadGames();

// load players
async function loadPlayers() {
  let players = await firebaseFetch('players');
  playercontainer.innerHTML = '';

  Object.keys(players).forEach(async function (playerId) {
    var player = players[playerId];
    var avatarImg = await generateAvatarPicture(player.avatar, false, true);
    var signup = player.signup ? formatDate(new Date(player.signup)) : "-";
    var login = player.login ? formatDate(new Date(player.login)) : "-";

    var card = document.createElement('div');
    card.id = 'game';

    gamedetails = "<div id='gamecard1'><b>" + sanitizeHtml(player.displayName) + "</b><br></div>";
    gamename = "<div id='gamecard2'>" + sanitizeHtml(truncate(player.bio, 100)) + "</div>"
    card.innerHTML = gamedetails + gamename;
    card.style.backgroundImage = `url(${avatarImg})`;

    playercontainer.prepend(card);

    card.onclick = async function () {
      const playerProfileRight = document.getElementById("playerProfileRight");
      const playerProfileLeft = document.getElementById("playerProfileLeft");

      const contentRight = document.createElement("div");
      const contentLeft = document.createElement("div");
      contentRight.innerHTML = '<center><br><i class="fa-solid fa-spinner fa-spin"></i></center>';
      contentLeft.innerHTML = '<center><br><i class="fa-solid fa-spinner fa-spin"></i></center>';

      playerProfileLeft.innerHTML = '';
      playerProfileRight.innerHTML = '';
      document.getElementById("playerdetailbutton").click();

      const avatar = document.createElement("img");
      avatar.src = avatarImg;
      playerProfileLeft.appendChild(avatar);

      const username = document.createElement("label");
      username.innerHTML = `
        <b>${sanitizeHtml(player.displayName)}</b><br>
        <p>@${sanitizeHtml(player.uid)}</p><br>
        Last Online: ${sanitizeHtml(login)}<br>
        Registered: ${sanitizeHtml(signup)}
      `
      playerProfileLeft.appendChild(username);

      if (firebase.auth().currentUser.uid == player.uid) {
        const bio = document.createElement("textarea");
        bio.value = `${sanitizeHtml(player.bio)}`;
        bio.onchange = function () {
          grecaptcha.execute().then(() => {
            if (!grecaptcha.getResponse()) return;
            database.ref(`players/${firebase.auth().currentUser.uid}/bio`).set(bio.value);
          })
        };
        playerProfileRight.appendChild(bio);

        const addRight = document.createElement("button");
        addRight.innerHTML = `<i class="fa fa-plus"></i>`;
        addRight.className = `dashedAdd`;
        addRight.onclick = function () {
          document.getElementById("customprofilebutton").click();
          document.getElementById("right-side").click();
        };

        const addLeft = document.createElement("button");
        addLeft.innerHTML = `<i class="fa fa-plus"></i>`;
        addLeft.className = `dashedAdd`;
        addLeft.onclick = function () {
          document.getElementById("customprofilebutton").click();
          document.getElementById("left-side").click();
        };

        playerProfileRight.appendChild(contentRight);
        playerProfileLeft.appendChild(contentLeft);
        playerProfileRight.appendChild(addRight);
        playerProfileLeft.appendChild(addLeft);
      } else {
        const bio = document.createElement("label");
        bio.innerHTML = `${sanitizeHtml(player.bio)}`
        playerProfileRight.appendChild(bio);

        playerProfileRight.appendChild(contentRight);
        playerProfileLeft.appendChild(contentLeft);
      }

      const editmode = (firebase.auth().currentUser.uid == player.uid) ? true : false;

      const left = await firebaseFetch(`profile/${playerId}/left`);
      const right = await firebaseFetch(`profile/${playerId}/right`);

      contentRight.innerHTML = '';
      contentLeft.innerHTML = '';

      if (right != null) {
        const sorted = Object.entries(right).sort((a, b) => a[1].order - b[1].order);
        Object.values(sorted).forEach(e => {
          loadProfileTiles(e[1], contentRight, editmode, e[0], "right", card, player.uid)
        });
      }

      if (left != null) {
        const sorted = Object.entries(left).sort((a, b) => a[1].order - b[1].order);
        Object.values(sorted).forEach(e => {
          loadProfileTiles(e[1], contentLeft, editmode, e[0], "left", card, player.uid)
        });
      }
    }
  });

  loadingPlayers = false;
}
loadPlayers();

// load catalog
async function loadCatalog() {
  let items = await firebaseFetch('catalog');;
  catalogcontainer.innerHTML = ''
  catalogSidebar.innerHTML = ''

  Object.keys(items).forEach(async function (itemId) {
    var item = items[itemId];
    var avatarImg = item.asset;
    var avatarData = {};
    var priceString = (item.price == 0) ? 'Free' : (item.price + ' Bits');

    try {
      avatarData["colors"] = (await firebaseFetch(`players/${firebase.auth().currentUser.uid}/avatar/colors`));
      avatarData[item.type] = item.asset;
      avatarImg = await generateAvatarPicture(avatarData, true, false)
    } catch (error) { }

    var card = document.createElement('div');
    card.className = 'catalogItem';
    card.innerHTML = `
      <img src="${sanitizeHtml(avatarImg)}"><br>
      <b>${sanitizeHtml(item.name)}</b><br>
      ${sanitizeHtml(item.type.charAt(0).toUpperCase() + item.type.slice(1))} - ${sanitizeHtml(priceString)}
    `

    card.onclick = async function () {
      document.getElementById('itemTitle').innerText = item.name;
      document.getElementById('itemDesc').innerText = item.description || "No Description";
      document.getElementById('itemPublisher').innerText = 'By ' + (await firebaseFetch('/players/' + item.uid)).displayName;
      document.getElementById("itemdetailbutton").click();
      document.getElementById("itemImage").src = avatarImg;
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

//checkbook system
var calculatedBits = 0;
function userCheckLoop() {
  database.ref(`players/${firebase.auth().currentUser.uid}/login`).set(firebase.auth().currentUser.metadata.lastSignInTime)
  database.ref(`players/${firebase.auth().currentUser.uid}`).on('value', async function (snapshot) {
    const items = snapshot.val();
    const inventoryObj = items.checkbook || {};
    const bitsSpentElem = document.getElementById("myBits")

    var bits = 100;
    var inventory = [];

    if (Object.keys(inventoryObj).length == 0) {
      setAvatarPreview(items.avatar, true);
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
          setAvatarPreview(items.avatar, true);
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

// ----------------------------------------------------------------------------------------------------------------------------

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