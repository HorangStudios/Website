async function openProfile(player, playerId) {
    if (player == null) window.location.href = '../404.html';

    const signup = player.signup ? formatDate(new Date(player.signup)) : "-";
    const login = player.login ? formatDate(new Date(player.login)) : "-";

    const contentRight = document.createElement("div");
    const contentLeft = document.createElement("div");
    contentRight.innerHTML = loaderTemplate;
    contentLeft.innerHTML = loaderTemplate;

    document.getElementById("playerdetailbutton").click();
    playerProfileLeft.innerHTML = '';
    playerProfileRight.innerHTML = '';

    generateAvatarPicture(player.avatar, false, true).then((avatarImg) => { avatar.src = avatarImg; });
    const avatar = document.createElement("img");
    playerProfileLeft.appendChild(avatar);
    
    const sharebutton = document.createElement("button");
    sharebutton.innerHTML = `<i class="fa fa-share"></i> Share`;
    sharebutton.onclick = function () {
        navigator.share({
            title: "HorangHill",
            text: "Check out this profile on HorangHill!",
            url: "https://horanghill.web.app?player=" + playerId,
        })
    }; playerProfileLeft.appendChild(sharebutton);

    const username = document.createElement("label");
    username.innerHTML = `
        <b>${sanitizeHtml(player.displayName)}</b><br>
        <p>@${sanitizeHtml(player.uid)}</p><br>
        Last Online: ${sanitizeHtml(login)}<br>
        Registered: ${sanitizeHtml(signup)}
      `
    playerProfileLeft.appendChild(username);

    if (firebase.auth().currentUser.uid == player.uid) {
        const bio = document.createElement("textarea");
        bio.value = `${sanitizeHtml(player.bio)}`;
        bio.onchange = function () {
            grecaptcha.execute().then(() => {
                if (!grecaptcha.getResponse()) return;
                database.ref(`players/${firebase.auth().currentUser.uid}/bio`).set(bio.value);
            })
        };
        playerProfileRight.appendChild(bio);

        const addRight = document.createElement("button");
        addRight.innerHTML = `<i class="fa fa-plus"></i>`;
        addRight.className = `dashedAdd`;
        addRight.onclick = function () {
            document.getElementById("customprofilebutton").click();
            document.getElementById("right-side").click();
        };

        const addLeft = document.createElement("button");
        addLeft.innerHTML = `<i class="fa fa-plus"></i>`;
        addLeft.className = `dashedAdd`;
        addLeft.onclick = function () {
            document.getElementById("customprofilebutton").click();
            document.getElementById("left-side").click();
        };

        playerProfileRight.appendChild(contentRight);
        playerProfileLeft.appendChild(contentLeft);
        playerProfileRight.appendChild(addRight);
        playerProfileLeft.appendChild(addLeft);
    } else {
        const bio = document.createElement("label");
        bio.innerHTML = `${sanitizeHtml(player.bio)}`
        playerProfileRight.appendChild(bio);

        playerProfileRight.appendChild(contentRight);
        playerProfileLeft.appendChild(contentLeft);
    }

    const editmode = (firebase.auth().currentUser.uid == player.uid) ? true : false;
    contentRight.innerHTML = '';
    contentLeft.innerHTML = '';

    firebaseFetch(`profile/${playerId}/left`).then((left) => {
        if (left == null) return;
        const sorted = Object.values(Object.entries(left).sort((a, b) => a[1].order - b[1].order));
        sorted.forEach(e => { loadProfileTiles(e[1], contentLeft, editmode, e[0], "left", player.uid) });
    });

    firebaseFetch(`profile/${playerId}/right`).then((right) => {
        if (right == null) return;
        const sorted = Object.values(Object.entries(right).sort((a, b) => a[1].order - b[1].order));
        sorted.forEach(e => { loadProfileTiles(e[1], contentRight, editmode, e[0], "right", player.uid) });
    });
}

function playerLink(uuid) {
    const contentRight = document.createElement("div");
    const contentLeft = document.createElement("div");
    contentRight.innerHTML = loaderTemplate;
    contentLeft.innerHTML = loaderTemplate;

    playerProfileLeft.innerHTML = '';
    playerProfileRight.innerHTML = '';
    playerProfileRight.appendChild(contentRight);
    playerProfileLeft.appendChild(contentLeft);

    document.getElementById("playerdetailbutton").click();
    firebaseFetch(`players/${uuid}`).then(p => { openProfile(p, uuid) });
}