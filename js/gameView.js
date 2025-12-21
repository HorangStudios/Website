async function openGame(game, id) {
    document.getElementById('gameTitle').innerText = game.title;
    document.getElementById('gameDescription').innerText = game.desc;
    document.getElementById("gamethumbnail").style.backgroundImage = `url(${game.thumbnail})`;
    document.getElementById("gamedetailstabtogglebutton").click();
    document.getElementById("playButton").onclick = function () {
        window.location.href = ("https://horangstudios.github.io/LigmaForge/player/?id=" + gameId + "&online=true")
    };

    if (game.uid == firebase.auth().currentUser.uid) {
        document.getElementById('editButton').removeAttribute("hidden");
        document.getElementById("editButton").onclick = function () {
            window.open(("details.html?id=" + gameId), "_blank").focus();
        };
    } else {
        document.getElementById('editButton').setAttribute("hidden", "")
    }

    document.getElementById('gamePublisher').onclick = () => { playerLink(game.uid) }
    document.getElementById('gamePublisher').innerText = 'By ' + (await firebaseFetch('/players/' + game.uid)).displayName;
}