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

firebase.auth().onAuthStateChanged(function (user) {
    if (user.displayName) {
        window.location.href = "html/index.html";
    }
});

// Get the form element
var form = document.getElementById('signup-form');

// Add a submit event listener to the form
function createacc() {
    event.preventDefault();

    const enteredCaptcha = document.getElementById('captchaInput').value
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var displayName = document.getElementById('displayName').value;

    if (enteredCaptcha != captchaResults) {
        window.alert("Incorrect Captcha!")
        window.location.reload()
        return
    };

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

let captchaResults
function generateCaptcha() {
    const canvas = document.getElementById('captchaCanvas');
    const ctx = canvas.getContext('2d');
    const characters = '!@#$%^&*()[];",.-=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const captchaText = generateRandomText(characters, 12);
    const x = canvas.width / 3.4;
    const y = canvas.height / 2;

    // Clear the canvas and setup text alignment
    canvas.width = canvas.width;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    //generate distraction
    ctx.font = '120px Times';
    ctx.fillStyle = '#222222';
    ctx.fillText(generateRandomText(characters, 256), 0, 0);
    ctx.fillText(generateRandomText(characters, 256), 0, 100);
    ctx.fillText(generateRandomText(characters, 256), 0, 200);

    // Set up text rotation and positioning
    ctx.font = '60px Times';
    ctx.fillStyle = '#fff';

    // Generate and apply unique rotations for each character
    for (let i = 0; i < captchaText.length; i++) {
        const rotation = Math.random() * 30 - 15; // Rotate between -15 and 15 degrees
        ctx.save();
        ctx.translate(x + i * 75, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(captchaText[i], 0, 0);
        ctx.restore();
    }

    //horanghill defense system watermark
    ctx.font = '40px Arial';
    ctx.translate(canvas.width / 2, y);
    ctx.fillStyle = 'gray';
    ctx.fillText("Click to regenerate.", 0, 65);
    ctx.fillText("HorangHill Defense System (hCaptcha).", 0, -65);

    //set and return the result
    captchaResults = captchaText
    return captchaText;
}

function generateRandomText(characters, length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

generateCaptcha();