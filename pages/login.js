// Initialize Firebase
const isLoginPage = true;
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

// Add a submit event listener to the form
var ISILOP
function createacc() {
    event.preventDefault();

    var signupbtn = document.getElementById("signupbtn");
    var loginbox = document.getElementById("loginbox");
    var errorMsg = document.getElementById("error");

    var enteredCaptcha = document.getElementById('captchaInput').value
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var displayName = document.getElementById('displayName').value;

    signupbtn.innerText = "Please Wait...";
    ISILOP = displayName;

    if (!captcha.verify(enteredCaptcha)) {
        errorMsg.innerText = 'Incorrect Captcha!';
        signupbtn.innerText = "Sign Up";
        return
    };

    if ((displayName && email && password) && (displayName.length >= 3)) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                userCredential.user.updateProfile({
                    displayName: displayName
                });
                window.location.href = "pages/index.html";
            })
            .catch((error) => {
                errorMsg.innerText = error.message;
                signupbtn.innerText = "Sign Up";
                loginbox.reset()
            });
    } else {
        signupbtn.innerText = "Sign Up";
        errorMsg.innerText = 'Error: Please fill all inputs to continue!';
    }
}

function loginacc() {
    event.preventDefault();

    var email = document.getElementById('emailLogin').value;
    var password = document.getElementById('passwordLogin').value;
    var loginBtn = document.getElementById("loginbtn");
    var signupbox = document.getElementById("signupbox");
    var errorMsg = document.getElementById("error1");

    loginBtn.innerText = "Please Wait...";
    loginBtn.disabled = true;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (user) { window.location.href = "pages/index.html"; })
        .catch(function (error) {
            errorMsg.innerText = error.message;
            loginBtn.innerText = "Sign In";
            loginBtn.disabled = false;
            signupbox.reset();
        });
};

function showlogin() {
    event.preventDefault();

    document.getElementById('signupbox').style.display = "none";
    document.getElementById('loginbox').style.display = "block";
}

const captcha = (function () {
    let valuekey;
    let font = [
        'Times',
        'Arial',
        'Papyrus',
        'Lucida Handwriting',
    ]

    function generateRandomText(characters, length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

    function RANDBETWEEN(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function verify(enteredCaptcha) {
        if (valuekey === enteredCaptcha) {
            return true
        } else {
            return false
        }
    }

    function generate() {
        const canvas = document.getElementById('captchaCanvas');
        const ctx = canvas.getContext('2d');
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const captchaText = generateRandomText(characters, 8);
        const x = canvas.width / 2.7;
        const y = canvas.height / 2;

        // Clear the canvas and setup text alignment
        canvas.width = canvas.width;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        //generate distraction
        ctx.font = `120px ${font[RANDBETWEEN(0, font.length)]}`;
        ctx.fillStyle = '#444444';
        ctx.fillText(generateRandomText(characters, 256), 0, 0);

        ctx.font = `120px ${font[RANDBETWEEN(0, font.length)]}`;
        ctx.fillStyle = '#444444';
        ctx.fillText(generateRandomText(characters, 256), 0, 100);

        ctx.font = `120px ${font[RANDBETWEEN(0, font.length)]}`;
        ctx.fillStyle = '#444444';
        ctx.fillText(generateRandomText(characters, 256), 0, 200);

        // Set up text rotation and positioning
        ctx.fillStyle = 'gray';

        // Generate and apply unique rotations for each character
        for (let i = 0; i < captchaText.length; i++) {
            const rotation = Math.random() * 30 - 30; // Rotate between -15 and 15 degrees
            ctx.font = `${RANDBETWEEN(60, 90)}px ${font[RANDBETWEEN(0, font.length)]}`;
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

        valuekey = captchaText;
    }

    return { generate, verify };
})();

captcha.generate()