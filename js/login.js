document.addEventListener("DOMContentLoaded", function () {
    let logoContainer = document.querySelector('.join-logo-container');
    let loginContainer = document.querySelector('.login-container');
    let topRight = document.querySelector('.top-right');
    let bottomLinks = document.querySelector('.bottom-links');
    let body = document.querySelector('body');
    setTimeout(() => {
        loginContainer.classList.add('visible'); 
        topRight.classList.add('visible');
        bottomLinks.classList.add('visible');
        body.classList.remove('hidden'); 
    }, 500);
    const loginBtn = document.querySelector(".login-btn");
    loginBtn.addEventListener("click", function(event) {
        event.preventDefault();
        loginUser();
    });
    document.querySelector('.guest-login-btn').addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = "http://127.0.0.1:5500/modul-10/join/pages/summary.html"; 
    });
});

function loginUser() {
    const emailInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    if (!emailInput || !passwordInput) {
        displayError("Check your email and password. Please try again.");
        return;
    }

    fetch(`${FIREBASE_URL}/members.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            let userFound = false;

            for (let key in data) {
                const user = data[key];
                if (user.email === emailInput && user.password === passwordInput) {
                    userFound = true;
                    alert("Login erfolgreich!");
                    console.log("Benutzer gefunden, leite weiter...");
                    window.location.href = "../pages/summary.html";
                    break;
                }
            }

            if (!userFound) {
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
