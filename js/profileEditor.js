// profile editor tabs
const profileTypes = document.getElementsByName("profile-selector");
Object.values(profileTypes).forEach(element => {
    element.onclick = function () {
        Object.values(document.getElementsByClassName("categorytabs")).forEach((item) => { item.style.display = "none" })
        document.getElementById(element.id.replace("-profile", "")).style.display = 'block'
    }
});

// add tile to profile
function loadProfileTiles(data, target, editMode, index, position, card, uuid) {
    let container = document.createElement("div");
    container.className = "profileCard";
    target.appendChild(container);

    let editButton = document.createElement("span");
    editButton.style.display = "none";
    editButton.title = "Edit Item";
    editButton.class = "profileItemEdit";
    editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';

    let previewButton = document.createElement("span");
    previewButton.title = "Save Changes";
    previewButton.style.display = "none";
    previewButton.innerHTML = '<i class="fa-solid fa-save"></i>';

    let cancelEdit = document.createElement("span");
    cancelEdit.title = "Close Editor";
    cancelEdit.style.display = "none";
    cancelEdit.innerHTML = '<i class="fa-solid fa-close"></i>';

    let editField, elem;
    switch (data.type) {
        case "iframe":
            elem = document.createElement("iframe");
            elem.src = data.url;
            container.appendChild(elem);

            editField = document.createElement("input");
            editField.placeholder = "Page URL Here...";
            editField.style.display = "none";
            editField.value = data.url;
            container.appendChild(editField);

            container.appendChild(editButton);
            container.appendChild(previewButton);
            container.appendChild(cancelEdit);

            previewButton.onclick = () => {
                cancelEdit.click();
                grecaptcha.execute().then(() => {
                    if (!grecaptcha.getResponse()) return;
                    if (editField.value) database.ref(`profile/${uuid}/${position}/${index}/url`).set(editField.value);
                    card.click();
                })
            }
            break;
        case "html":
            elem = document.createElement("iframe");
            container.appendChild(elem);
            elem.src = "about:blank";
            elem.style.resize = "none";
            elem.onload = function () {
                try {
                    let iframeDoc = elem.contentDocument || elem.contentWindow.document;
                    elem.style.height = iframeDoc.body.scrollHeight + 5 + "px";
                } catch (e) { }
            };

            editField = document.createElement("textarea");
            editField.placeholder = "Code here...";
            editField.style.display = "none";
            editField.value = data.code;
            container.appendChild(editField);

            container.appendChild(editButton);
            container.appendChild(previewButton);
            container.appendChild(cancelEdit);

            previewButton.onclick = () => {
                cancelEdit.click();
                grecaptcha.execute().then(() => {
                    if (!grecaptcha.getResponse()) return;
                    if (editField.value) database.ref(`profile/${uuid}/${position}/${index}/code`).set(editField.value);
                    card.click();
                })
            }

            let iframeDoc = elem.contentDocument || elem.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write('<link rel="stylesheet" href="../css/iframe.css">' + data.code);
            iframeDoc.close();
            setTimeout(() => {
                try {
                    elem.style.height = iframeDoc.body.scrollHeight + 5 + "px";
                } catch (e) { }
            }, 10);
            break;
    }

    if (editMode) {
        let delButton = document.createElement("span");
        container.appendChild(delButton);
        delButton.class = "profileItemEdit";
        delButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
        delButton.title = "Delete Item";
        delButton.style.float = 'right';
        delButton.onclick = () => {
            grecaptcha.execute().then(() => {
                if (!grecaptcha.getResponse()) return;
                database.ref(`profile/${uuid}/${position}/${index}`).remove();
                container.remove();
            })
        };

        let upButton = document.createElement("span");
        container.appendChild(upButton);
        upButton.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        upButton.title = "Move Up";
        upButton.onclick = async () => {
            target.innerHTML = '<center><br><i class="fa-solid fa-spinner fa-spin"></i></center>';
            await moveItem(`profile/${uuid}/${position}/`, index, "up");
            card.click();
        };

        let downButton = document.createElement("span");
        container.appendChild(downButton);
        downButton.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
        downButton.title = "Move Down";
        downButton.onclick = async () => {
            target.innerHTML = '<center><br><i class="fa-solid fa-spinner fa-spin"></i></center>';
            await moveItem(`profile/${uuid}/${position}/`, index, "down");
            card.click();
        };

        editButton.style.display = "inline-block";
        editButton.onclick = () => {
            editButton.style.display = "none";
            previewButton.style.display = "inline-block";
            cancelEdit.style.display = "inline-block";
            if (editField) { editField.style.display = "block"; elem.style.display = "none" }
        };

        cancelEdit.onclick = () => {
            editButton.style.display = "inline-block";
            previewButton.style.display = "none";
            cancelEdit.style.display = "none";
            if (editField) { editField.style.display = "none"; elem.style.display = "block" }
        };
    }
}

//move item up or down
async function moveItem(path, key, direction) {
    await grecaptcha.execute();
    if (!grecaptcha.getResponse()) return;

    const items = await firebaseFetch(path);
    const entries = Object.entries(items).sort((a, b) => a[1].order - b[1].order);

    const index = entries.findIndex(([k]) => k === key);
    if (index === -1) return;

    let swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= entries.length) return;

    const [key1, item1] = entries[index];
    const [key2, item2] = entries[swapWith];

    database.ref(`${path}/${key1}/order`).set(item2.order);
    database.ref(`${path}/${key2}/order`).set(item1.order);
}

//add markdown 
async function addhtml() {
    const htmlcode = document.getElementById("htmlEditor").value;
    const position = document.getElementById("right-side").checked ? "right" : "left";
    const length = Object.keys(await firebaseFetch(`profile/${firebase.auth().currentUser.uid}/${position}`) || {}).length;
    const data = { code: htmlcode, type: "html", order: length };

    grecaptcha.execute().then(() => {
        if (!grecaptcha.getResponse()) return;
        if (htmlcode) database.ref(`profile/${firebase.auth().currentUser.uid}/${position}`).push(data);
        document.getElementById("htmlEditor").value = "";
        document.getElementById("players").click();
    })
}

//add iframe
async function addiframe() {
    const url = document.getElementById("pageUrl").value;
    const position = document.getElementById("right-side").checked ? "right" : "left";
    const length = Object.keys(await firebaseFetch(`profile/${firebase.auth().currentUser.uid}/${position}`) || {}).length;
    const data = { url: url, type: "iframe", order: length };

    grecaptcha.execute().then(() => {
        if (!grecaptcha.getResponse()) return;
        if (url) database.ref(`profile/${firebase.auth().currentUser.uid}/${position}`).push(data);
        document.getElementById("pageUrl").value = "";
        document.getElementById("players").click();
    })
}