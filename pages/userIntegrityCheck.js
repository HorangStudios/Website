firebase.auth().onAuthStateChanged(async function (user) {
    // if logged in, make sure user data on player db exists (also fill missing data)
    if (user) {
        let displayNameData

        if (typeof ISILOP !== 'undefined') {
            displayNameData = ISILOP
        } else {
            displayNameData = firebase.auth().currentUser.displayName
            if (typeof isLoginPage == 'undefined') {
                document.getElementById('main').style.display = "block"
                gamescontainer.innerHTML = '';
                document.getElementById('greetings').innerHTML = `${greetings}, ${sanitizeHtml(displayNameData)}!`
            }
        }

        const userDataTemplate = {
            "displayName": displayNameData,
            "avatar": {
                "shirt": false,
                "pants": false,
                "face": false,
                "colors": {
                    "head": `#ffffff`,
                    "torso": `#1e90ff`,
                    "rightArm": `#ffffff`,
                    "leftArm": `#ffffff`,
                    "rightLeg": `#808080`,
                    "leftLeg": `#808080`,
                    "eye": `#ffffff`
                }
            },
            "bio": "HorangHill Player",
            "checkbook": [],
            "uid": firebase.auth().currentUser.uid,
        };

        database.ref(`players/${firebase.auth().currentUser.uid}`).once('value', async function (snapshot) {
            if (snapshot.exists()) {
                let items = snapshot.val();
                let updated = false;

                for (let key in userDataTemplate) {
                    if (!(key in items)) {
                        items[key] = userDataTemplate[key];
                        updated = true;
                    } else if (typeof userDataTemplate[key] === 'object' && userDataTemplate[key] !== null && key !== 'inventory') {
                        for (let subKey in userDataTemplate[key]) {
                            if (!(subKey in items[key])) {
                                items[key][subKey] = userDataTemplate[key][subKey];
                                updated = true;
                            }
                        }
                    }
                }

                if (updated) {
                    await database.ref(`players/${firebase.auth().currentUser.uid}`).update(items);
                }

                if (typeof isLoginPage == 'undefined') {
                    userCheckLoop()
                }
            } else {
                await database.ref(`players/${firebase.auth().currentUser.uid}`).set(userDataTemplate);

                if (typeof ISILOP !== 'undefined') {
                    await firebase.auth().currentUser.updateProfile({
                        displayName: ISILOP
                    });
                }

                if (typeof isLoginPage == 'undefined') {
                    userCheckLoop()
                }
            }

            if (typeof isLoginPage !== 'undefined') {
                window.location.href = "pages/index.html";
            }
        });
    } else if (typeof isLoginPage !== 'undefined') {
        document.getElementById("loader").style.display = 'none'
        document.getElementById("Login").style.display = 'block'
    }
});