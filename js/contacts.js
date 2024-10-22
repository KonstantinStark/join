let users = [];

function init() {
    loadUsers();
}

function toggleOverlay() {
    let overlay = document.getElementById('overlay');
    overlay.classList.toggle('d-none');
    setTimeout(() => {
        overlay.classList.toggle('show');
    }, overlay.classList.contains('d-none') ? 500 : 10);
}

async function addUser() {
    let newUser = getUserInput();
    if (!validateUserInput(newUser)) return;
    newUser.color = getRandomColor();
    resetInputFields();
    await postData("/users", newUser);
    await loadUsers();
    closeOverlay();
}

function closeOverlay() {
    let overlay = document.getElementById('overlay');
    overlay.classList.remove('show');
    setTimeout(() => overlay.classList.add('d-none'), 500);
}

function getRandomColor() {
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
    }
    return color;
}

async function postData(path = "", data = {}) {
    await fetch(FIREBASE_URL + path + ".json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

async function loadUsers(path = '/users') {
    let response = await fetch(FIREBASE_URL + path + '.json');
    let data = await response.json();
    users = [];
    if (data) {
        Object.keys(data).forEach(key => {
            users.push({ id: key, ...data[key], color: data[key]['color'] || getRandomColor() });
        });
    }
    loadData();
}

function getInitials(name) {
    return name.split(" ").map(part => part.charAt(0).toUpperCase()).join("");
}

function getUserInput() {
    return {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value
    };
}

function resetInputFields() {
    ["name", "phone", "email"].forEach(id => document.getElementById(id).value = "");
}

function loadData() {
    let contentListRef = document.getElementById("contact-list");
    contentListRef.innerHTML = "";
    users.sort((a, b) => a.name.localeCompare(b.name));
    let currentLetter = '';
    users.forEach((person, index) => {
        let initials = getInitials(person.name);
        let firstLetter = person.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            contentListRef.innerHTML += `<div class="letter-section"><div class="letter">${currentLetter}</div><hr class="divider"></div>`;
        }
        contentListRef.innerHTML += createContactCard(person, index, initials);
    });
}

function editContact(index) {
    let person = users[index];
    let editContactDiv = document.getElementById('edit-contacts');
    let initials = getInitials(person.name);
    editContactDiv.innerHTML = createEditContactTemplate(person, index, initials);
}

async function deleteContact(index) {
    let person = users[index];
    try {
        let response = await fetch(`${FIREBASE_URL}/users/${person.id}.json`, { method: "DELETE" });
        if (response.ok) {
            document.getElementById(`contact-${index}`).remove();
        }
    } catch (error) {
        console.error('Error:', error);
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
    document.getElementById('save-button').onclick = () => saveUser(index);
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
    if (!validateUserInput(updatedUser)) return;
    let person = users[index];
    updatedUser.color = person.color;
    try {
        let response = await fetch(`${FIREBASE_URL}/users/${person.id}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser),
        });
        if (response.ok) {
            users[index] = { id: person.id, ...updatedUser };
            loadData();
            exitEditOverlay();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function validateUserInput(user) {
    const nameRegex = /^[a-zA-ZäöüÄÖÜß\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\-\s]+$/;
    if (!nameRegex.test(user.name)) {
        alert("Please enter a valid name.");
        return false;
    }
    if (!emailRegex.test(user.email)) {
        alert("Please enter a valid email.");
        return false;
    }
    if (!phoneRegex.test(user.phone)) {
        alert("Please enter a valid phone number.");
        return false;
    }
    return true;
}

function exitEditOverlay() {
    let overlay = document.getElementById('edit-overlay');
    overlay.classList.remove('show');
    setTimeout(() => overlay.classList.add('d-none'), 500);
}

function exitOverlay() {
    let overlay = document.getElementById('overlay');
    overlay.classList.remove('show');
    setTimeout(() => overlay.classList.add('d-none'), 500);
}

document.querySelectorAll('.exit-overlay, .cancel-button button').forEach(button => {
    button.addEventListener('click', () => exitOverlay());
});

function toggleHamburgerMenu() {
    document.getElementById("hamburger-menu").classList.toggle("d-none");
}
