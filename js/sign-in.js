/**
 * Initializes the form and policy validation after the document has loaded.
 * @listens document#DOMContentLoaded
 */
function init() {
    setupFormListeners();
    setupPolicyError();
}

/**
 * Sets up event listeners for form inputs and the submit button.
 */
function setupFormListeners() {
    const form = document.querySelector("form");
    form.addEventListener("input", validateUserInput);
    form.addEventListener("submit", handleSubmit);
}

/**
 * Handles form submission, prevents the default action, and pushes data to Firebase if valid.
 */
function handleSubmit(event) {
    event.preventDefault();
    if (validateUserInput()) pushDataToFirebase();
}

/**
 * Validates user input by checking all required fields.
 */
function validateUserInput() {
    let isValid = true;
    isValid &= validateName();
    isValid &= validateEmail();
    isValid &= validatePassword();
    isValid &= validatePolicy();
    document.getElementById("signup-btn").disabled = !isValid;
    return isValid;
}

/**
 * Validates the name input field.
 */
function validateName() {
    const name = document.getElementById("name");
    const errorText = document.getElementById("name-error-text");
    return validateField(name, errorText, /^[a-zA-ZäöüÄÖÜß\s]+$/, "Invalid name format.");
}

/**
 * Validates the email input field.
 */
function validateEmail() {
    const email = document.getElementById("email");
    const errorText = document.getElementById("email-error-text");
    return validateField(email, errorText, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format.");
}

/**
 * Validates the password and confirm password fields.
 */
function validatePassword() {
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");
    const errorText = document.getElementById("password-error");
    if (!password.value || !confirmPassword.value || password.value !== confirmPassword.value) {
        errorText.textContent = "Passwords do not match.";
        errorText.style.display = "block";
        return false;
    }
    errorText.style.display = "none";
    return true;
}

/**
 * Validates the terms and policy checkbox.
 */
function validatePolicy() {
    const checkbox = document.getElementById("accept-policy");
    document.getElementById("policy-error").style.display = checkbox.checked ? "none" : "block";
    return checkbox.checked;
}

/**
 * Validates a single input field based on a regular expression.
 */
function validateField(input, errorText, regex, errorMessage) {
    if (!input.value || !regex.test(input.value)) {
        errorText.textContent = errorMessage;
        errorText.style.display = "block";
        input.classList.add("error");
        return false;
    }
    errorText.style.display = "none";
    input.classList.remove("error");
    return true;
}

/**
 * Pushes the collected data to Firebase.
 */
function pushDataToFirebase() {
    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        initials: getInitials(document.getElementById("name").value)
    };
    fetch(`${FIREBASE_URL}/members.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(() => window.location.href = "../pages/login.html")
        .catch(error => console.error("Fehler beim Speichern:", error));
}

/**
 * Extracts the initials from a full name.
 */
function getInitials(name) {
    return name.split(" ").map(n => n.charAt(0).toUpperCase()).join("");
}
