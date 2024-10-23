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