let users = [];


function init() {
    loadUsers();
}

function toggleOverlay() {
    let overlay = document.getElementById('overlay');
    if (overlay.classList.contains('d-none')) {
        overlay.classList.remove('d-none');
        setTimeout(function () {
            overlay.classList.add('show');
        }, 10);
    } else {
        overlay.classList.remove('show');
        setTimeout(function () {
            overlay.classList.add('d-none');
        }, 500);
    }
}

async function addUser() {
    let newUser = getUserInput();
    if (!validateUserInput(newUser)) {
        return;
    }
    newUser.color = getRandomColor();
    resetInputFields();
    await postData("/users", newUser);
    await loadUsers();
    closeOverlay();
}


function closeOverlay() {
    let overlay = document.getElementById('overlay');
    overlay.classList.remove('show');
    setTimeout(() => {
        overlay.classList.add('d-none');
    }, 500);
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
    users.sort((a, b) => a.name.localeCompare(b.name));
    users.forEach((person, index) => {
        let initials = getInitials(person.name);
        contentListRef.innerHTML += createContactCard(person, index, initials);
    });
}

function editContact(index) {
    let editContactDiv = document.getElementById('edit-contacts');
    let person = users[index];
    let initials = getInitials(person.name);
    editContactDiv.innerHTML = '';
    editContactDiv.innerHTML += createEditContactTemplate(person, index, initials);
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

function editContactOverlay(index) {
    let person = users[index];
    document.getElementById("edit-name").value = person.name;
    document.getElementById("edit-phone").value = person.phone;
    document.getElementById("edit-email").value = person.email;
    let circle = document.getElementById(`circle-${index}`);
    if (circle) {
        circle.setAttribute('fill', person.color);
    }
    document.getElementById('save-button').onclick = function () {
        saveUser(index);
        let overlay = document.getElementById('edit-overlay');
        overlay.classList.add('d-none');
    };
    editContact(index);
}

function getUpdatedUserData(index) {
    return {
        name: document.getElementById("edit-name").value,
        phone: document.getElementById("edit-phone").value,
        email: document.getElementById("edit-email").value
    };
}

async function saveUser(index) {
    let updatedUser = getUpdatedUserData(index);
    if (!validateUserInput(updatedUser)) {
        return;
    }
    let person = users[index];
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
            users[index] = { id: person.id, ...updatedUser };
            loadData();
            exitEditOverlay();
        } else {
            console.error('Update failed', response.status);
        }
    } catch (error) {
        console.error('Error during update', error);
    }
    editContact(index);
}

function validateUserInput(user) {
    const nameRegex = /^[a-zA-ZÃ¤Ã¶Ã¼Ã„Ã–ÃœÃŸ\s]+$/;
    if (!user.name || !nameRegex.test(user.name)) {
        alert("Please enter a valid name (letters and spaces only).");
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email || !emailRegex.test(user.email)) {
        alert("Please enter a valid email address.");
        return false;
    }
    const phoneRegex = /^[0-9+\-\s]+$/;
    if (!user.phone || !phoneRegex.test(user.phone)) {
        alert("Please enter a valid phone number (numbers and special characters only).");
        return false;
    }
    return true;
}

function exitEditOverlay() {
    let overlay = document.getElementById('edit-overlay');
    overlay.classList.add('d-none');
    setTimeout(() => {
        overlay.classList.add('d-none');
    }, 500);
    editContact();
}


function exitOverlay() {
    let overlay = document.getElementById('overlay');
    overlay.classList.remove('show');
    setTimeout(() => {
        overlay.classList.add('d-none');
    }, 500);
}

document.querySelectorAll('.exit-overlay, .cancel-button button').forEach(button => {
    button.addEventListener('click', function () {
        exitOverlay();
    });
});

function toggleHamburgerMenu() {
    const menu = document.getElementById("hamburger-menu");
    menu.classList.toggle("d-none"); // Das Menü anzeigen oder ausblenden
}