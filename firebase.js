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
    contentListRef.innerHTML = ""; // Clear the current content

    console.log(users); // Check if users array is populated

    // Loop through all users and add them to the list
    for (let index = 0; index < users.length; index++) {
        let people = users[index];
        contentListRef.innerHTML += /*html*/`
        <div onclick="editContact(${index})" class="content-container">${people.name} <br>
             ${people.email}</div>
        `;
    }
}

function editContact(index) {
    console.log('editContact called for index:', index); // Debugging

    let editContact = document.getElementById('edit-contacts');
    // editContact.innerHTML = '';

    let person = users[index]; // Get the specific user being edited

    // Display edit form or fields for the selected user
    editContact.innerHTML += /*html*/`
        <div>
          <p>Name:${person.name}</p>
        </div>
        <div>
            <p>Email:${person.email}</p>
        </div>
        <button onclick="saveContact(${index})">delete</button>
    `;
}