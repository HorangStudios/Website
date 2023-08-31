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

firebase.auth().onAuthStateChanged(function(user) {
    if (user.displayName) {
        window.location.href = "html/index.html";
    }
});

// Get the form element
var form = document.getElementById('signup-form');

// Add a submit event listener to the form
function createacc() {
    event.preventDefault();

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var displayName = document.getElementById('displayName').value;

    if (displayName && email && password) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                userCredential.user.updateProfile({
                    displayName: displayName
                });

                window.alert('Account created successfully!')

                window.location.href = "html/index.html";
            })
            .catch((error) => {
                document.getElementById('error').innerText = error.message;
            });
    } else {
        document.getElementById('error').innerText = 'Error: Please fill all inputs to continue!';
    }
}

function guestacc() {
    firebase.auth().signInAnonymously()
        .then(() => {
            window.location.href = "html/index.html";
        })
        .catch((error) => {
            document.getElementById('error1').innerText = error.message;
        });
}

function opendialog() {
    document.getElementById("insanedialog").style.display = "flex";
}
function closedialog() {
    document.getElementById("insanedialog").style.display = "none";
}

function loginacc() {
    event.preventDefault();

    var email = document.getElementById('emailLogin').value;
    var password = document.getElementById('passwordLogin').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (user) { window.location.href = "html/index.html"; })
        .catch(function (error) { document.getElementById('error1').innerText = error.message; });
};

function showlogin() {
    document.getElementById('signupbox').style.display = "none"
    document.getElementById('loginbox').style.display = "block"
}