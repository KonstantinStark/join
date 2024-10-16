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
        <div onclick="editContact(${index})" class="content-container"> <br>
             
             <p>Name: ${people.name}</p>
             <p>E-mail: ${people.email}</p>
             </div>
        `;
    }
}

function editContact(index) {
    let editContact = document.getElementById('edit-contacts');
    let person = users[index]; // Holen Sie den Benutzer basierend auf dem Array-Index

    editContact.innerHTML = ''; // Clear previous content
    editContact.innerHTML += /*html*/`
        <div id="contact-${index}">
            <img src="svg placeholder circle" alt="">
          <h3>${person.name}</h3>
          <div class="delete-edit-contact-wrapper">
            <span>
                <img src="" alt="">
                <p onclick="edit(${index})">Edit</p>
            </span>
            <span>
                <img src="" alt="">
                <p onclick="deleteContact(${index})">Delete</p>
            </span>
          </div>
        </div>

        <p>Contact Information <br></p>
        
        <div>
            
            <p><strong>Email: </strong> <br> ${person.email}</p>
            <p><strong>Phone:</strong> <br> ${person.phone}</p>
        </div>
    `;
}


async function deleteContact(index) {
    let person = users[index]; // Hole den spezifischen Benutzer aus dem Array

    try {
        // Lösche den Kontakt in Firebase, indem die Firebase-ID verwendet wird
        let response = await fetch(`${FIREBASE_URL}/users/${person.id}.json`, {
            method: "DELETE",
        });

        // Überprüfe, ob die Anfrage erfolgreich war
        if (response.ok) {
            
            document.getElementById(`contact-${index}`).remove();
        } else {
            console.error('Löschen fehlgeschlagen mit Status:', response.status);
        }
    } catch (error) {
        console.error('Fehler beim Löschen des Kontakts:', error);
    }
}





