firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        const userDataTemplate = {
            "displayName": firebase.auth().currentUser.displayName,
            "avatar": {
                "shirt": false,
                "pants": false,
                "colors": {
                    "head": 0xffffff,
                    "torso": 0x1e90ff,
                    "rightArm": 0xffffff,
                    "leftArm": 0xffffff,
                    "rightLeg": 0x808080,
                    "leftLeg": 0x808080
                }
            },
            "bio": "HorangHill Player",
            "inventory": [0, 1],
            "uid": firebase.auth().currentUser.uid,
            "bits": 100
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
                database.ref(`players/${firebase.auth().currentUser.uid}`).set(userDataTemplate)
                    .then(() => {
                        userCheckLoop()
                    });
            }
        });
    }
});