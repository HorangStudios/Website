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
  document.getElementById('greetings').innerHTML = `${greetings}, ${displayName}!`

  let games = snapshot.val();

  Object.keys(games).forEach(function (gameId) {
    var game = games[gameId];

    //spawn card
    var card = document.createElement('div');
    card.id = 'game';
    gamedetails = "<div id='gamecard1'><h2>" + game.title + "</h2>" + game.createdBy + "</div>";
    gamename = "<br><div id='gamecard2'>" + truncate(game.desc, 100) + "</div>"
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

      //if user is game owner
      if (game.uid == firebase.auth().currentUser.uid) {
        document.getElementById('editButton').removeAttribute("hidden");
        document.getElementById("editButton").onclick = function () {
          window.location.href = ("details.html?id=" + gameId);
        };
      } else {
        document.getElementById('editButton').setAttribute("hidden", "")
      }
    }

    // //card styling (accent color)
    // const colorThief = new ColorThief();
    // const img = new Image();
    // img.addEventListener('load', function () {
    //   colorThief.getColor(img);
    // });
    // let imageURL = game.thumbnail;
    // let googleProxyURL = 'https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=';
    // img.crossOrigin = 'Anonymous';
    // img.src = googleProxyURL + encodeURIComponent(imageURL);

    gamescontainer.prepend(card);
  });
});

// ----------------------------------------------------------------------------------------------------------------------------

function updateDisplayName() {
  try {
    firebase.auth().currentUser.updateProfile({
      displayName: document.getElementById('displayName').value
    });
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
    label.innerHTML = label.innerHTML + ` (${file.name})`
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
    label.innerHTML = label.innerHTML + ` (${file.name})`
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