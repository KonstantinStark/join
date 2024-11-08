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
    newUser.initials = getInitials(newUser.name);
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
    contentListRef.innerHTML = ""; // Clear the current list

    // Sort and display contacts
    users.sort((a, b) => a.name.localeCompare(b.name));
    let currentLetter = '';
    
    users.forEach((person, index) => {
        let initials = getInitials(person.name);
        let firstLetter = person.name.charAt(0).toUpperCase();
        
        // Render a new letter section when the initial changes
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            contentListRef.innerHTML += `
                <div class="letter-section">
                    <div class="letter">${currentLetter}</div>
                    <hr class="divider">
                </div>`;
        }
        
        // Add the contact card
        contentListRef.innerHTML += createContactCard(person, index, initials);
    });
}

/* obsidian */

function editContact(index) {
    let person = users[index];
    let editContactDiv = document.getElementById('edit-contacts');
    let initials = getInitials(person.name);
    
    // Update the content with the selected contact details
    editContactDiv.innerHTML = createEditContactTemplate(person, index, initials);

    // Remove the 'active-contact' class from any other content container
    let allContentContainers = document.querySelectorAll('.content-container');
    allContentContainers.forEach(container => {
        container.classList.remove('active-contact');
    });

    // Add 'active-contact' class to the clicked user's container
    let selectedContainer = document.getElementById(`content-container-${index}`);
    selectedContainer.classList.add('active-contact');
}


async function deleteContact(index) {
    let person = users[index];
    try {
        let response = await fetch(`${FIREBASE_URL}/users/${person.id}.json`, { method: "DELETE" });
        
        if (response.ok) {
            // Remove the contact from the local users array
            users.splice(index, 1); // Remove the user from the users array
            
            // Re-render the contact list with the updated users array
            loadData();

            //obsidian

            let editContactsRef = document.getElementById('edit-contacts');
            editContactsRef.classList.add('d-none');
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
    editContact(index);
}

function validateUserInput(user) {
    let nameRef = document.getElementById('name');
    let nameTextRef = document.getElementById('name-error-text');
    let emailRef = document.getElementById('email');
    let emailTextRef = document.getElementById('email-error-text');
    let phoneRef = document.getElementById('phone');
    let phoneTextRef= document.getElementById('phone-error-text');

    const nameRegex = /^[a-zA-ZäöüÄÖÜß\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\-\s]+$/;
    if (!nameRegex.test(user.name)) {
        nameRef.classList.add("error");
        emailRef.classList.add("error");
        phoneRef.classList.add("error");
        nameTextRef.style.display = "block";
        emailTextRef.style.display = "block";
        phoneTextRef.style.display = "block";
        return false;
    }
    if (!emailRegex.test(user.email)) {
        emailRef.classList.add("error");
        phoneRef.classList.add("error");
        emailTextRef.style.display = "block";
        phoneTextRef.style.display = "block";
        return false;
    }
    if (!phoneRegex.test(user.phone)) {
        phoneRef.classList.add("error");
        phoneTextRef.style.display = "block";
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

function oneClickContact() {
    const listWrapper = document.getElementById("contact-list-wrapper");
    const textWrapper = document.getElementById("contact-text-wrapper");
    const screenWidth = window.innerWidth;

    if (screenWidth <= 940) {
        if (listWrapper && textWrapper) {
            // Versteckt den `contact-list-wrapper`
            listWrapper.style.display = "none";

            // Zeigt den `contact-text-wrapper` an
            textWrapper.style.display = "flex";
            textWrapper.style.visibility = "visible"; // Testweise hinzufügen
            textWrapper.style.opacity = "1";          // Testweise hinzufügen
        }
    }
}