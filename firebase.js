let users = [];

function init() {
    loadUsers(); // Lädt die User-Daten, wenn die Seite initialisiert wird
}

const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";

async function addUser() {
    let nameValue = document.getElementById("name").value;
    let phoneValue = document.getElementById("phone").value;
    let emailValue = document.getElementById("email").value;

    // Neues User-Objekt erstellen
    let newUser = { name: nameValue, phone: phoneValue, email: emailValue };

    // Felder nach dem Absenden leeren
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";

    // Post an Firebase senden
    await postData("/users", newUser);

    // Daten neu laden
    await loadUsers();
}

async function postData(path = "", data = {}) {
    await fetch(FIREBASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

async function loadUsers(path = '/users') {
    let userResponse = await fetch(FIREBASE_URL + path + '.json');
    let responseToJson = await userResponse.json();
    console.log('Serverantwort', responseToJson);

    users = []; // Leere das Users-Array
    if (responseToJson) {
        Object.keys(responseToJson).forEach(key => {
            users.push({
                id: key,
                name: responseToJson[key]['name'],
                phone: responseToJson[key]['phone'],
                email: responseToJson[key]['email']
            });
        });
        console.log('Users-Array', users);
    }

    // Nach dem Laden die Daten anzeigen
    loadData();
}

function loadData() {
    let contentListRef = document.getElementById("contact-list");
    contentListRef.innerHTML = ""; // Leere den aktuellen Inhalt

    // Schleife durch alle Users und füge sie hinzu
    for (let i = 0; i < users.length; i++) {
        let people = users[i];
        contentListRef.innerHTML += /*html*/`
        <div class="content-container">${people.name} <br>
             ${people.email}</div>
        `;
    }
}
