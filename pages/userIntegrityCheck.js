firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        const userDataTemplate = {
            "displayName": firebase.auth().currentUser.displayName,
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

        database.ref(`players/${firebase.auth().currentUser.uid}`).once('value', function (snapshot) {
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
                    database.ref(`players/${firebase.auth().currentUser.uid}`).update(items);
                }

                userCheckLoop()
            } else {
                database.ref(`players/${firebase.auth().currentUser.uid}`).set(userDataTemplate).then(userCheckLoop);
            }
        });
    }
});