document.addEventListener("DOMContentLoaded", initPage);

/**
 * Initializes the page by adding a delay to simulate loading, showing elements, and adding event listeners.
 */
function initPage() {
    setTimeout(() => document.body.classList.add("loaded"), 1000);
    showElements();
    addEventListeners();
}

/**
 * Displays specified elements on the page after a delay and removes the 'hidden' class from the body.
 */
function showElements() {
    const elements = ['.login-container', '.top-right', '.bottom-links'];
    setTimeout(() => {
        elements.forEach(sel => document.querySelector(sel)?.classList.add('visible'));
        document.body.classList.remove('hidden');
    }, 500);
}

/**
 * Adds event listeners to the login and guest login buttons.
 */
function addEventListeners() {
    document.querySelector(".login-btn")?.addEventListener("click", e => {
        e.preventDefault();
        loginUser();
    });
    document.querySelector('.guest-login-btn')?.addEventListener('click', e => {
        e.preventDefault();
        localStorage.setItem("isGuest", true);
        window.location.href = "../pages/welcome.html";
    });
}

/**
 * Logs in a user by validating their email and password against Firebase data.
 */
function loginUser() {
    const email = getInputValue("email"), password = getInputValue("password");
    if (!email || !password) return displayError("Check your email and password.");
    fetch(`${FIREBASE_URL}/members.json`)
        .then(res => res.ok ? res.json() : Promise.reject("Network error"))
        .then(data => validateUser(data, email, password))
        .catch(() => displayError("An error has occurred. Please try again."));
}

/**
 * Validates user credentials against the provided data.
 */
function validateUser(data, email, password) {
    const user = Object.values(data).find(u => u.email === email && u.password === password);
    user ? pushDataToFirebase(user) : displayError("Invalid email or password.");
}

/**
 * Pushes user data to Firebase and redirects to the welcome page.
 */
function pushDataToFirebase(user) {
    const initials = user.name.split(" ").map(n => n[0].toUpperCase()).join("");
    localStorage.setItem("loggedInUser", JSON.stringify({ name: user.name, email: user.email, initials }));
    localStorage.removeItem("isGuest");
    window.location.href = "../pages/welcome.html";
}

/**
 * Retrieves the trimmed value of an input element by its ID.
 */
function getInputValue(id) {
    return document.getElementById(id)?.value.trim();
}

/**
 * Displays an error message on the page for 5 seconds.
 */
function displayError(message) {
    let errorContainer = document.querySelector('.error-message') || createErrorContainer();
    errorContainer.textContent = message;
    errorContainer.style.display = "block";
    setTimeout(() => errorContainer.style.display = "none", 5000);
}

/**
 * Creates and inserts an error message container into the DOM.
 */
function createErrorContainer() {
    const errorContainer = document.createElement("div");
    errorContainer.classList.add("error-message");
    document.getElementById("password")?.parentNode.insertBefore(errorContainer, document.getElementById("password").nextSibling);
    return errorContainer;
}