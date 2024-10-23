window.onload = function() {
    const logoContainer = document.querySelector('.join-logo-container');
    const loginContainer = document.querySelector('.login-container');
    const topRight = document.querySelector('.top-right');
    const bottomLinks = document.querySelector('.bottom-links');
    const body = document.querySelector('body');

    // Die Animation des Logos dauert 2 Sekunden
    setTimeout(() => {
        // Sichtbarkeit nach der Animation
        loginContainer.classList.add('visible'); // Füge die 'visible'-Klasse hinzu
        topRight.classList.add('visible'); // Füge die 'visible'-Klasse hinzu
        bottomLinks.classList.add('visible'); // Füge die 'visible'-Klasse hinzu
        body.classList.remove('hidden'); // Entferne die "hidden"-Klasse vom Body
    }, 500); // Wartezeit für die Animation
};