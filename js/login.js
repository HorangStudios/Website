// Initialize Firebase rtdb
var isLoginPage = true;
var database = firebase.database();

// Add a submit event listener to the form
var ISILOP
function createacc() {
    event.preventDefault();

    var signupbtn = document.getElementById("signupbtn");
    var loginbox = document.getElementById("loginbox");
    var errorMsg = document.getElementById("error");

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var displayName = document.getElementById('displayName').value;

    signupbtn.innerText = "Please Wait...";
    ISILOP = displayName;

    grecaptcha.execute().then(() => {
        if (!grecaptcha.getResponse()) {
            errorMsg.innerText = 'Please complete the reCAPTCHA!';
            signupbtn.innerText = "Sign Up";
            return;
        }

        if ((displayName && email && password) && (displayName.length >= 3)) {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => { })
                .catch((error) => {
                    errorMsg.innerText = error.message;
                    signupbtn.innerText = "Sign Up";
                    loginbox.reset();
                });
        } else {
            signupbtn.innerText = "Sign Up";
            errorMsg.innerText = 'Please fill all inputs to continue!';
        }
    })
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
        .then(function (user) {
            let params = new URLSearchParams(window.location.search).toString();
            window.location.href = `pages/index.html${params ? "?" + params : ""}`;
        })
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