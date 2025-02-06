let users = [];
let isResponsive = false;
let isEditModeOn = false;
let contactTextWrapper = document.getElementById('contact-text-wrapper');
let contactListWrapper = document.getElementById('contact-list-wrapper');
let userInitials = "";
window.onload = init;

/**
 * Initializes the application by setting up event listeners and loading users.
 */
function init() {
    window.onload = init;
    const mediaQuery = window.matchMedia('(max-width: 940px)');
    mediaQuery.addEventListener('change', handleMediaChange);
    handleMediaChange(mediaQuery);
    loadUsers();
}

/**
 * Toggles the visibility of the overlay.
 */
function toggleOverlay() {
    let overlay = document.getElementById('overlay');
    overlay.classList.toggle('d-none');
    setTimeout(() => {
        overlay.classList.toggle('show');
    }, overlay.classList.contains('d-none') ? 500 : 10);
}

/**
 * Adds a new user to the list after validating the input.
 */
async function addUser() {
    let newUser = getUserInput();
    if (!validateUserInput(newUser)) return;
    newUser.color = getRandomColor();
    newUser.initials = getInitials(newUser.name);
    resetInputFields();
    await postData("/users", newUser);
    await loadUsers();
    closeOverlay();
    let newUserIndex = users.findIndex(user => user.name === newUser.name);
    editContact(newUserIndex);
}

/**
 * Closes the overlay by removing the 'show' class and adding the 'd-none' class after a delay.
 */
function closeOverlay() {
    let overlay = document.getElementById('overlay');
    overlay.classList.remove('show');
    setTimeout(() => overlay.classList.add('d-none'), 500);
}

/**
 * Generates a random color in hexadecimal format.
 */
function getRandomColor() {
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Posts data to a specified path using a POST request.
 */
async function postData(path = "", data = {}) {
    await fetch(FIREBASE_URL + path + ".json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

/**
 * Loads users from a specified path and updates the UI.
 */
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

/**
 * Gets the initials from a name.
 */
function getInitials(name) {
    userInitials = name.split(" ").map(part => part.charAt(0).toUpperCase()).join("");
    return userInitials;
}

/**
 * Gets user input from the form fields.
 */
function getUserInput() {
    return {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value
    };
}

/**
 * Resets the input fields in the form.
 */
function resetInputFields() {
    ["name", "phone", "email"].forEach(id => document.getElementById(id).value = "");
}

/**
 * Loads and displays a sorted list of users, grouped by the first letter of their name.
 */
function loadData() {
    let contentListRef = document.getElementById("contact-list");
    contentListRef.innerHTML = "";
    users.sort((a, b) => a.name.localeCompare(b.name));
    let currentLetter = '';
    users.forEach((person, index) => {
        currentLetter = handleLetterChange(person, currentLetter, contentListRef);
        contentListRef.innerHTML += createContactCard(person, index, getInitials(person.name));
    });
}

/**
 * Handles the change of a letter section in the contact list.
 * If the first letter of the current person's name differs from the previous one,
 * it adds a new letter section to the list.
 */
function handleLetterChange(person, currentLetter, contentListRef) {
    let firstLetter = person.name.charAt(0).toUpperCase();
    if (firstLetter !== currentLetter) {
        currentLetter = firstLetter;
        contentListRef.innerHTML += `
            <div class="letter-section">
                <div class="letter">${currentLetter}</div>
                <hr class="divider">
            </div>`;
    }
    return currentLetter;
}

/**
 * Enables edit mode for a contact.
 */
function editContact(index) {
    isEditModeOn = true;
    let person = users[index];
    let initials = getInitials(person.name);
    toggleContactView();
    document.getElementById('edit-contacts').innerHTML = createEditContactTemplate(person, index, initials);
    document.querySelectorAll('.content-container').forEach(c => c.classList.remove('active-contact'));
    document.getElementById(`content-container-${index}`).classList.add('active-contact');
    document.getElementById('name-initials').innerHTML = `
    <div style="background-color: ${person.color}; height: 100px; width: 100px; border-radius: 100%; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 24px;">${initials}</span>
    </div>`;
}

/**
 * Toggles the contact view between list and text views.
 */
function toggleContactView() {
    contactListWrapper.classList.toggle('d-none', isResponsive);
    contactTextWrapper.classList.toggle('d-flex', isResponsive);
    contactListWrapper.classList.toggle('d-flex', !isResponsive);
}

/**
 * Deletes a contact from the list.
 */
async function deleteContact(index) {
    let person = users[index];
    try {
        let response = await fetch(`${FIREBASE_URL}/users/${person.id}.json`, { method: "DELETE" });
        if (response.ok) {
            users.splice(index, 1);
            loadData();
            let editContactsRef = document.getElementById('edit-contacts');
            if (editContactsRef.classList.contains('d-none')) {
                editContactsRef.classList.remove('d-none');
            }
            location.reload();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Opens the edit overlay for a contact.
 */
function openEditOverlay(index) {
    let overlay = document.getElementById('edit-overlay');
    editContactOverlay(index);
    overlay.classList.remove('d-none');
    setTimeout(() => overlay.classList.add('show'), 10);
}

/**
 * Populates the edit overlay with the contact's data.
 */
function editContactOverlay(index) {
    let person = users[index];
    document.getElementById("edit-name").value = person.name;
    document.getElementById("edit-phone").value = person.phone;
    document.getElementById("edit-email").value = person.email;
    document.getElementById('save-button').onclick = () => saveUser(index);
}

/**
 * Gets the updated user data from the edit form.
 */
function getUpdatedUserData(index) {
    return {
        name: document.getElementById("edit-name").value,
        phone: document.getElementById("edit-phone").value,
        email: document.getElementById("edit-email").value
    };
}

/**
 * Sends a PATCH request to update user data in the Firebase database.
 */
async function updateUserData(personId, updatedUser) {
    try {
        let response = await fetch(`${FIREBASE_URL}/users/${personId}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser),
        });
        return response.ok;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

/**
 * Saves the updated user data and updates the UI if successful.
 */
async function saveUser(index) {
    let updatedUser = getUpdatedUserData(index);
    if (!validateUserInput(updatedUser)) return;
    let person = users[index];
    updatedUser.color = person.color;
    const updateSuccessful = await updateUserData(person.id, updatedUser);
    if (updateSuccessful) {
        users[index] = { id: person.id, ...updatedUser };
        loadData();
        exitEditOverlay();
    }
    editContact(index);
}

/**
 * Validates the user input.
 */
function validateUserInput(user) {
    let refs = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        nameText: document.getElementById('name-error-text'),
        emailText: document.getElementById('email-error-text'),
        phoneText: document.getElementById('phone-error-text')
    };
    if (!/^[a-zA-ZäöüÄÖÜß\s]+$/.test(user.name)) return setErrorState([refs.name, refs.email, refs.phone], [refs.nameText, refs.emailText, refs.phoneText]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) return setErrorState([refs.email, refs.phone], [refs.emailText, refs.phoneText]);
    if (!/^[0-9+\-\s]+$/.test(user.phone)) return setErrorState([refs.phone], [refs.phoneText]);
    return true;
}

/**
 * Sets the error state for input fields and displays error messages.
 */
function setErrorState(inputs, texts) {
    inputs.forEach(el => el.classList.add("error"));
    texts.forEach(el => el.style.display = "block");
    return false;
}

/**
 * Closes the edit overlay.
 */
function exitEditOverlay() {
    let overlay = document.getElementById('edit-overlay');
    overlay.classList.remove('show');
    setTimeout(() => overlay.classList.add('d-none'), 500);
}

/**
 * Closes the main overlay.
 */
function exitOverlay() {
    let overlay = document.getElementById('overlay');
    overlay.classList.remove('show');
    setTimeout(() => overlay.classList.add('d-none'), 500);
}

document.querySelectorAll('.exit-overlay, .cancel-button button').forEach(button => {
    button.addEventListener('click', () => exitOverlay());
});

/**
 * Toggles the hamburger menu visibility.
 */
function toggleHamburgerMenu() {
    document.getElementById("hamburger-menu").classList.toggle("d-none");
}

/**
 * Handles the click event for contacts on mobile devices.
 */
function oneClickContact() {
    const listWrapper = document.getElementById("contact-list-wrapper");
    const textWrapper = document.getElementById("contact-text-wrapper");
    const screenWidth = window.innerWidth;
    if (screenWidth <= 940) {
        if (listWrapper && textWrapper) {
            listWrapper.style.display = "none";
            textWrapper.style.display = "flex";
            textWrapper.style.visibility = "visible";
            textWrapper.style.opacity = "1";
        }
    }
}

/**
 * Handles media query changes for responsiveness.
 */
function handleMediaChange(event) {
    if (!event.matches) {
        contactListWrapper.classList.remove('d-none');
        contactListWrapper.classList.add('d-flex');
        isResponsive = false;
    } else {
        isResponsive = true;
        displayContactMobile(isEditModeOn);
    }
}

/**
 * Displays the contact view for mobile devices.
 */
function displayContactMobile(isMobileMode) {
    if (isMobileMode) {
        contactListWrapper.classList.add('d-none');
        contactTextWrapper.classList.add('d-flex');
        contactListWrapper.classList.remove('d-flex');
        contactTextWrapper.classList.remove('d-none');
    }
}

/**
 * Navigates back to the contact list view.
 */
function goBackContacts() {
    const contactTextWrapper = document.getElementById('contact-text-wrapper');
    if (contactTextWrapper) {
        contactListWrapper.classList.remove('d-none');
        contactTextWrapper.classList.remove('d-flex');
    }
}