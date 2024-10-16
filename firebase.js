// Globale Variablen
let users = [];
const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";

// Initialisiert die Anwendung
function init() {
    loadUsers();
   
}

// Fügt einen neuen Benutzer hinzu
async function addUser() {
    let newUser = getUserInput();

    // Eingabefelder leeren
    resetInputFields();

    // Neuen Benutzer zur Datenbank hinzufügen und die Benutzerliste neu laden
    await postData("/users", newUser);
    await loadUsers();
}

// Holt Benutzerdaten von den Eingabefeldern
function getUserInput() {
    return {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
    };
}

// Leert die Eingabefelder
function resetInputFields() {
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";
}

// POST-Anfrage an Firebase
async function postData(path = "", data = {}) {
    await fetch(FIREBASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

// Lädt die Benutzerdaten von Firebase
async function loadUsers(path = '/users') {
    let userResponse = await fetch(FIREBASE_URL + path + '.json');
    let responseToJson = await userResponse.json();
    console.log('Serverantwort', responseToJson);

    users = [];
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

    loadData();
}

// Zeigt die Benutzer im Kontaktlistenbereich an
function loadData() {
    let contentListRef = document.getElementById("contact-list");
    contentListRef.innerHTML = "";
    console.log(users);

    users.forEach((people, index) => {
        contentListRef.innerHTML += /*html*/`
        <div onclick="editContact(${index})" class="content-container-${index} load-data-container" id="content-container-${index}"> 
            <br>
            <svg width="100" height="100">
                <circle id="circle" cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
            </svg>
            <div class="name-email-contact-list-wrapper">
                <p>${people.name}</p>
                <p>${people.email}</p>
            </div>
        </div>`;
    });
}

// Bearbeitet einen Kontakt
function editContact(index) {
    let editContactDiv = document.getElementById('edit-contacts');
    let person = users[index];
    
    editContactDiv.innerHTML = '';
    editContactDiv.innerHTML += /*html*/`
   <div id="contact-${index}">
        <div class="svg-name-wrapper">
            <svg width="100" height="100">
                <circle id="circle" cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
            </svg>
            <div class="name-delete-edit-wrapper">
                <h1>${person.name}</h1>
                <div class="delete-edit-contact-wrapper">
                    <span>
                        <p onclick="openEditOverlay(${index})">Edit</p>
                    </span>
                    <span>
                        <p onclick="deleteContact(${index})">Delete</p>
                    </span>
                </div>
            </div>
        </div>
        <p>Contact Information <br></p>
        <div>
            <p><strong>Email: </strong><br> ${person.email} </p>
            <p><strong>Phone:</strong><br> ${person.phone}</p>
        </div>
    </div>`;

   
}

// Löscht einen Kontakt
async function deleteContact(index) {
    let person = users[index];
    try {
        let response = await fetch(`${FIREBASE_URL}/users/${person.id}.json`, {
            method: "DELETE",
        });

        if (response.ok) {
            document.getElementById(`contact-${index}`).remove();
            document.getElementById(`content-container-${index}`).remove();
        } else {
            console.error('delete unsuccessful', response.status);
        }
    } catch (error) {
        console.error('error', error);
    }
}

// Öffnet das Bearbeitungs-Overlay
function openEditOverlay(index) {
    let overlay = document.getElementById('edit-overlay');

    // Daten ins Overlay laden
    editContactOverlay(index);

    // Overlay anzeigen
    overlay.classList.remove('d-none');
    setTimeout(() => overlay.classList.add('show'), 10);
}

// Schließt das Overlay
function exitEditOverlay() {
    let overlay = document.getElementById('edit-overlay');
    overlay.classList.remove('show');
    setTimeout(() => overlay.classList.add('d-none'), 500);
}

// function exitOverlay() {
//     let overlay = document.getElementById('edit-overlay');
//     overlay.classList.remove('show');
//     setTimeout(() => overlay.classList.add('d-none'), 500);
// }

// Befüllt das Bearbeitungs-Overlay mit den Kontaktdaten
function editContactOverlay(index) {
    let person = users[index];
    document.getElementById("edit-name").value = person.name;
    document.getElementById("edit-phone").value = person.phone;
    document.getElementById("edit-email").value = person.email;

    // Den Index des Kontakts speichern, damit wir wissen, welchen Kontakt wir speichern
    document.getElementById('save-button').onclick = function () {
        saveUser(index);  // Aufruf von saveUser mit dem Index des zu bearbeitenden Kontakts

        let overlay = document.getElementById('edit-overlay');
        overlay.classList.add('d-none');
    };


    editContact(index);
    
}

// Speichert die Änderungen an einem Kontakt
async function saveUser(index) {
    let updatedUser = getUpdatedUserData(index);

    let person = users[index];

    try {
        let response = await fetch(`${FIREBASE_URL}/users/${person.id}.json`, {
            method: "PATCH",  // PATCH wird verwendet, um nur die geänderten Felder zu aktualisieren
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
            // Die Änderungen in der lokalen Liste aktualisieren
            users[index] = { id: person.id, ...updatedUser };  // Update mit id sicherstellen

            // Die Oberfläche aktualisieren
            loadUsers();
            exitOverlay();  // Overlay schließen
        } else {
            console.error('Update fehlgeschlagen', response.status);
        }
    } catch (error) {
        console.error('Fehler beim Update', error);
    }

    editContact(index);
}

// Holt die aktualisierten Benutzerdaten aus dem Bearbeitungs-Overlay
function getUpdatedUserData(index) {
    return {
        name: document.getElementById("edit-name").value || users[index].name,  // Verwende alte Werte, wenn nichts geändert wurde
        phone: document.getElementById("edit-phone").value || users[index].phone,
        email: document.getElementById("edit-email").value || users[index].email,
    };
}


