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

// Get the form element
var form = document.getElementById('signup-form');

// Add a submit event listener to the form
function createacc() {
    event.preventDefault();

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var displayName = document.getElementById('displayName').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            userCredential.user.updateProfile({
                displayName: displayName
            });

            window.alert('Account created successfully!')

            showlogin()
        })
        .catch((error) => {
            document.getElementById('error').innerText = error.message;
        });
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