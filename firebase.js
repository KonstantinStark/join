let users = [];
const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";

function init() {
    loadUsers();
}

async function addUser() {
    let newUser = getUserInput();
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


// ziemlich sicher das dass in contacts.js kann

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

    users.forEach((person, index) => {
        contentListRef.innerHTML += `
        <div onclick="editContact(${index})" class="content-container load-data-container" id="content-container-${index}"> 
            <br>
            <svg width="100" height="100">
                <circle id="circle" cx="50" cy="50" r="40" fill="${person.color}" />
            </svg>
            <div class="name-email-contact-list-wrapper">
                <p>${person.name}</p>
                <p>${person.email}</p>
            </div>
        </div>`;
    });
}

function editContact(index) {
    let editContactDiv = document.getElementById('edit-contacts');
    let person = users[index];
    
    editContactDiv.innerHTML = '';
    editContactDiv.innerHTML += `
   <div id="contact-${index}">
        <div class="svg-name-wrapper">
            <svg width="100" height="100">
                <circle id="circle" cx="50" cy="50" r="40" fill="${person.color}" />
            </svg>
            <div class="name-delete-edit-wrapper">
                <h1>${person.name}</h1>
                <div class="delete-edit-contact-wrapper">
                    <span>
                        <p onclick="openEditOverlay(${index})"> <img class="contacts-icon" src="./assets/img/edit.svg"> Edit</p>
                    </span>
                    <span>
                        <p onclick="deleteContact(${index})"> <img class="contacts-icon" src="./assets/img/delete.svg"> Delete</p>
                    </span>
                </div>
            </div>
        </div> <br>
        <p>Contact Information</p> <br>
        <div>
            <p><strong>Email: <br> </strong>${person.email} </p> <br>
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

    document.getElementById('save-button').onclick = function () {
        saveUser(index);

        let overlay = document.getElementById('edit-overlay');
        overlay.classList.add('d-none');
    };

    editContact(index);
}

async function saveUser(index) {
    let updatedUser = getUpdatedUserData(index);
    let person = users[index];

    try {
        let response = await fetch(`${FIREBASE_URL}/users/${person.id}.json`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
            users[index] = { id: person.id, ...updatedUser };
            loadUsers();
        } else {
            console.error('Update fehlgeschlagen', response.status);
        }
    } catch (error) {
        console.error('Fehler beim Update', error);
    }

    editContact(index);
}

function getUpdatedUserData(index) {
    return {
        name: document.getElementById("edit-name").value || users[index].name,
        phone: document.getElementById("edit-phone").value || users[index].phone,
        email: document.getElementById("edit-email").value || users[index].email
    };
}