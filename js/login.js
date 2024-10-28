window.onload = function() {
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
};

// login.js
document.querySelector('.login-btn').addEventListener('click', function(event) {
    event.preventDefault(); // Verhindert das automatische Absenden des Formulars

    // Referenzen zu den Eingabefeldern
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    
    // Überprüfen, ob Felder leer sind
    if (!email.value.trim() || !password.value.trim()) {
        // Bestehende Fehlermeldung entfernen, falls vorhanden
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Fehlermeldung erstellen und anzeigen
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = 'Check your email and password. Please try again.';
        document.querySelector('.login-box').appendChild(errorMessage);

        // Füge rote Umrandung zu leeren Feldern hinzu
        if (!email.value.trim()) {
            email.style.border = '2px solid red';
        } else {
            email.style.border = ''; // Entfernt die Umrandung, wenn das Feld ausgefüllt ist
        }

        if (!password.value.trim()) {
            password.style.border = '2px solid red';
        } else {
            password.style.border = '';
        }
    } else {
        // Wenn beide Felder ausgefüllt sind, kann das Formular gesendet werden
        document.querySelector('form').submit();
    }
});