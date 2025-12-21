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

//format date
function formatDate(today) {
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return mm + '/' + dd + '/' + yyyy
}

// game submit
form.addEventListener('submit', function (event) {
  event.preventDefault();
  form.style.display = 'none';

  var title = document.getElementById('title-text').value;
  var desc = document.getElementById('descbox').value;

  grecaptcha.execute().then(() => {
    if (!grecaptcha.getResponse()) return;
    if (title && desc) {
      if (imagedataurl === undefined) return;
      if (gamejson === undefined) return;

      const userid = firebase.auth().currentUser.uid;
      const storageRef = database.ref('storage').push({ file: gamejson, uid: userid });

      const game = {
        title: title,
        desc: desc,
        thumbnail: imagedataurl,
        createdAt: formatDate(new Date()),
        hhls: storageRef.key,
        uid: userid
      };

      database.ref('games').push(game);
      form.reset();
      form.style.display = 'block';

      document.getElementById("thumbnail-label").innerHTML = '<i class="fa-solid fa-upload"></i> <b>Game thumbnail</b>';
      document.getElementById("hhls-label").innerHTML = '<i class="fa-solid fa-upload"></i> <b>HHLS file</b>';
      openTab(event, 'Home');
    }
  })
});

//shirt submit
shirtform.addEventListener('submit', async function (event) {
  event.preventDefault();
  shirtform.style.display = 'none';

  var name = document.getElementById('name-shirt').value;
  var price = document.getElementById('price-shirt').value;

  grecaptcha.execute().then(() => {
    if (!grecaptcha.getResponse()) return;
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
  })
});

// pants submit
pantsform.addEventListener('submit', function (event) {
  event.preventDefault();
  pantsform.style.display = 'none';

  var name = document.getElementById('name-pants').value;
  var price = document.getElementById('price-pants').value;

  grecaptcha.execute().then(() => {
    if (!grecaptcha.getResponse()) return;
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
  })
});