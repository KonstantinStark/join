let users = [];
const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";

function init() {
    loadUsers();
}

async function addUser() {
    let newUser = getUserInput();

    // Validierung der Benutzereingaben
    if (!validateUserInput(newUser)) {
        return; // Beenden, wenn die Eingabe ungültig ist
    }

    newUser.color = getRandomColor();
    resetInputFields();
    await postData("/users", newUser);
    await loadUsers();
}

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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

    users = [];
    if (responseToJson) {
        Object.keys(responseToJson).forEach(key => {
            users.push({
                id: key,
                name: responseToJson[key]['name'],
                phone: responseToJson[key]['phone'],
                email: responseToJson[key]['email'],
                color: responseToJson[key]['color'] || getRandomColor()
            });
        });
    }

    loadData();
}

// Hilfsfunktion, um die Initialen des Benutzers zu extrahieren
function getInitials(name) {
    let nameParts = name.split(" ");
    let initials = nameParts.map(part => part.charAt(0).toUpperCase()).join("");
    return initials;
}

function getUserInput() {
    return {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value
    };
}

function resetInputFields() {
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";
}

function loadData() {
    let contentListRef = document.getElementById("contact-list");
    contentListRef.innerHTML = "";

    // Sortiere die Benutzer alphabetisch nach dem Namen
    users.sort((a, b) => a.name.localeCompare(b.name));

    users.forEach((person, index) => {
        let initials = getInitials(person.name); // Initialen des Benutzers holen

        contentListRef.innerHTML += `
        <div onclick="editContact(${index})" class="content-container load-data-container" id="content-container-${index}"> 
            <br>
            <svg width="100" height="100">
                <circle id="circle-${index}" cx="50" cy="50" r="40" fill="${person.color}" />
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24">${initials}</text>
            </svg>
            <div class="name-email-contact-list-wrapper">
                <p>${person.name}</p>
                <p class="mail-color">${person.email}</p>
            </div>
        </div>`;
    });
}

function editContact(index) {
    let editContactDiv = document.getElementById('edit-contacts');
    let person = users[index];
    let initials = getInitials(person.name); // Initialen des Benutzers holen

    editContactDiv.innerHTML = '';
    editContactDiv.innerHTML += `
   <div id="contact-${index}">
        <div class="svg-name-wrapper">
            <svg width="100" height="100">
                <circle id="circle-${index}" cx="50" cy="50" r="40" fill="${person.color}" />
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24">${initials}</text>
            </svg>
            <div class="name-delete-edit-wrapper">
                <h1>${person.name}</h1>
                <div class="delete-edit-contact-wrapper">
                    <span>
                        <p class="edit-btn" onclick="openEditOverlay(${index})"> <img class="contacts-icon" src="./assets/img/edit.svg"> Edit</p>
                    </span>
                    <span>
                        <p class="edit-btn" onclick="deleteContact(${index})"> <img class="contacts-icon" src="./assets/img/delete.svg"> Delete</p>
                    </span>
                </div>
            </div>
        </div> <br>
        <p>Contact Information</p> <br>
        <div>
            <p><strong>Email: <br> <p class="mail-color"></strong>${person.email}</p> </p> <br>
            <p><strong>Phone: <br> </strong>${person.phone}</p> <br>
        </div>
    </div>`;
}

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

function openEditOverlay(index) {
    let overlay = document.getElementById('edit-overlay');
    editContactOverlay(index);
    overlay.classList.remove('d-none');
    setTimeout(() => overlay.classList.add('show'), 10);
}

function exitEditOverlay() {
    let overlay = document.getElementById('edit-overlay');
    overlay.classList.toggle('d-none');
    setTimeout(() => overlay.classList.add('d-none'), 500);
}

function editContactOverlay(index) {
    let person = users[index];
    document.getElementById("edit-name").value = person.name;
    document.getElementById("edit-phone").value = person.phone;
    document.getElementById("edit-email").value = person.email;

    // Setze den Kreis mit der richtigen Farbe
    let circle = document.getElementById(`circle-${index}`);
    if (circle) {
        circle.setAttribute('fill', person.color); // Die gespeicherte Farbe verwenden
    }

    document.getElementById('save-button').onclick = function () {
        saveUser(index);

        let overlay = document.getElementById('edit-overlay');
        overlay.classList.add('d-none');
    };

    editContact(index); // Zeigt den bearbeiteten Kontakt erneut an
}

async function saveUser(index) {
    let updatedUser = getUpdatedUserData(index);

    // Validierung der Benutzereingaben
    if (!validateUserInput(updatedUser)) {
        return; // Beenden, wenn die Eingabe ungültig ist
    }

    let person = users[index];

    // Stelle sicher, dass der Farbwert des bearbeiteten Benutzers korrekt beibehalten wird
    updatedUser.color = person.color;

    try {
        let response = await fetch(`${FIREBASE_URL}/users/${person.id}.json`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
            users[index] = { id: person.id, ...updatedUser }; // Benutzer aktualisieren
            loadUsers(); // Liste neu laden
        } else {
            console.error('Update fehlgeschlagen', response.status);
        }
    } catch (error) {
        console.error('Fehler beim Update', error);
    }

    editContact(index); // Bearbeiteten Kontakt erneut anzeigen
}

function validateUserInput(user) {
    // Name-Validation: nur Buchstaben (keine Zahlen oder Sonderzeichen)
    const nameRegex = /^[a-zA-ZäöüÄÖÜß\s]+$/;
    if (!user.name || !nameRegex.test(user.name)) {
        alert("Bitte geben Sie einen gültigen Namen ein (nur Buchstaben und Leerzeichen).");
        return false;
    }

    // Email-Validation: Standard E-Mail-Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email || !emailRegex.test(user.email)) {
        alert("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
        return false;
    }

    // Telefon-Validation: nur Zahlen und bestimmte zulässige Sonderzeichen (+, -, etc.)
    const phoneRegex = /^[0-9+\-\s]+$/;
    if (!user.phone || !phoneRegex.test(user.phone)) {
        alert("Bitte geben Sie eine gültige Telefonnummer ein (nur Zahlen und gültige Sonderzeichen).");
        return false;
    }

    return true;
}

document.getElementById('save-button').onclick = function () {
    saveUser();
};
