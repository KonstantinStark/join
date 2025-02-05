document.addEventListener("DOMContentLoaded", initPage);

function initPage() {
    setTimeout(() => document.body.classList.add("loaded"), 1000);
    showElements();
    addEventListeners();
}

function showElements() {
    const elements = ['.login-container', '.top-right', '.bottom-links'];
    setTimeout(() => {
        elements.forEach(sel => document.querySelector(sel)?.classList.add('visible'));
        document.body.classList.remove('hidden');
    }, 500);
}

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

function loginUser() {
    const email = getInputValue("email"), password = getInputValue("password");
    if (!email || !password) return displayError("Check your email and password.");
    fetch(`${FIREBASE_URL}/members.json`)
        .then(res => res.ok ? res.json() : Promise.reject("Network error"))
        .then(data => validateUser(data, email, password))
        .catch(() => displayError("An error has occurred. Please try again."));
}

function validateUser(data, email, password) {
    const user = Object.values(data).find(u => u.email === email && u.password === password);
    user ? pushDataToFirebase(user) : displayError("Invalid email or password.");
}

function pushDataToFirebase(user) {
    const initials = user.name.split(" ").map(n => n[0].toUpperCase()).join("");
    localStorage.setItem("loggedInUser", JSON.stringify({ name: user.name, email: user.email, initials }));
    localStorage.removeItem("isGuest");
    window.location.href = "../pages/welcome.html";
}

function getInputValue(id) {
    return document.getElementById(id)?.value.trim();
}

function displayError(message) {
    let errorContainer = document.querySelector('.error-message') || createErrorContainer();
    errorContainer.textContent = message;
    errorContainer.style.display = "block";
    setTimeout(() => errorContainer.style.display = "none", 5000);
}

function createErrorContainer() {
    const errorContainer = document.createElement("div");
    errorContainer.classList.add("error-message");
    document.getElementById("password")?.parentNode.insertBefore(errorContainer, document.getElementById("password").nextSibling);
    return errorContainer;
}
