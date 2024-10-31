document.addEventListener("DOMContentLoaded", () => {
    const body = document.body,
        loginContainer = document.querySelector('.login-container'),
        topRight = document.querySelector('.top-right'),
        bottomLinks = document.querySelector('.bottom-links');
    setTimeout(() => {
        [loginContainer, topRight, bottomLinks].forEach(el => el.classList.add('visible'));
        body.classList.remove('hidden');
    }, 500);
    document.querySelector(".login-btn").addEventListener("click", e => {
        e.preventDefault();
        loginUser();
    });
    document.querySelector('.guest-login-btn').addEventListener('click', e => {
        e.preventDefault();
        localStorage.setItem("isGuest", true);
        window.location.href = "../pages/welcome.html";
    });
});

function loginUser() {
    const email = document.getElementById("email").value.trim(),
        password = document.getElementById("password").value.trim();
    if (!email || !password) return displayError("Check your email and password. Please try again.");
    fetch(`${FIREBASE_URL}/members.json`)
        .then(res => res.ok ? res.json() : Promise.reject(`Network response was not ok ${res.statusText}`))
        .then(data => {
            const user = Object.values(data).find(u => u.email === email && u.password === password);
            if (user) {
                console.log("Benutzer gefunden, leite weiter...");
                localStorage.setItem("loggedInUser", JSON.stringify({ name: user.name, email: user.email }));
                localStorage.removeItem("isGuest");
                window.location.href = "../pages/welcome.html";
            } else {
                displayError("Ungültige E-Mail oder Passwort. Bitte versuche es erneut.");
            }
        })
        .catch(error => {
            console.error("Fehler beim Login:", error);
            displayError("Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.");
        });
}

function displayError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();

    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;
    document.querySelector('.login-box').appendChild(errorMessage);
}
