async function catalogView(item, itemId) {
    var priceString = (item.price == 0) ? 'Free' : (item.price + ' Bits');

    document.getElementById('itemTitle').innerText = item.name;
    document.getElementById('itemDesc').innerText = item.description || "No Description";
    document.getElementById("itemdetailbutton").click();
    document.getElementById("itemImage").src = item.asset;
    document.getElementById("buyButton").innerText = priceString;
    
    document.getElementById("buyButton").onclick = async function () {
        if (item.price <= calculatedBits) {
            const currentUser = firebase.auth().currentUser;
            const playerData = await firebaseFetch('/players/' + currentUser.uid);

            if (playerData.checkbook && Object.values(playerData.checkbook).some(entry => entry.product === parseInt(itemId))) {
                document.getElementById("buyButton").innerText = "You already have it!"
            } else {
                firebase.database().ref(`players/${firebase.auth().currentUser.uid}/checkbook/${Date.now()}`).set({
                    type: "catalogPurchase",
                    product: parseInt(itemId)
                })
                document.getElementById("buyButton").innerText = "Bought!"
            }
        } else {
            document.getElementById("buyButton").innerText = "Not enough Bits!"
        }
    };

    document.getElementById('itemPublisher').innerText = 'By ' + (await firebaseFetch('/players/' + item.uid)).displayName;
    document.getElementById('itemPublisher').onclick = () => { playerLink(item.uid) }
}