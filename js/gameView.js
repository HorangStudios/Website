async function openGame(game, id) {
    //description
    document.getElementById('gameTitle').innerText = game.title;
    document.getElementById('gameDescription').innerText = game.desc;
    document.getElementById("gamethumbnail").src = game.thumbnail;
    document.getElementById("gamedetailstabtogglebutton").click();

    // visits and playing
    document.getElementById('active').innerText = 'Playing: ...';
    document.getElementById('visits').innerText = 'Unique Visits: ...';

    //play button
    document.getElementById("playButton").onclick = function () {
        window.location.href = ("https://horangstudios.github.io/LigmaForge/player/?id=" + id + "&online=true")
    };

    //edit button
    if (game.uid == firebase.auth().currentUser.uid) {
        document.getElementById('editButton').style.display = 'block';
        document.getElementById("editButton").onclick = function () {
            window.open(("details.html?id=" + id), "_blank").focus();
        };
    } else {
        document.getElementById('editButton').style.display = 'none';
    }

    //creation and update date
    document.getElementById("gamecreation").innerText = 'Created: ' + game.createdAt;
    document.getElementById("gameupdated").innerText = 'Updated: ' + (game.update ? game.update : "-");

    //creator name
    document.getElementById('gamePublisher').onclick = () => { playerLink(game.uid) };
    document.getElementById('gamePublisher').innerText = '...';
    document.getElementById('gamePublisher').innerText = 'By ' + (await firebaseFetch('/players/' + game.uid)).displayName;

    //set visits and playing
    var gameSession = await firebaseFetch('/session/' + id);
    var filterActive = Object.values(gameSession).filter(item => (new Date()).getTime() - (new Date(item.age)).getTime() < 10000)
    document.getElementById('visits').innerText = 'Unique Visits: ' + Object.keys(gameSession).length;
    document.getElementById('active').innerText = 'Playing: ' + filterActive.length;
}