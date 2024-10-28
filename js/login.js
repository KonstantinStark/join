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

document.querySelector('.login-btn').addEventListener('click', function(event) {
    event.preventDefault();
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    if (!email.value.trim() || !password.value.trim()) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = 'Check your email and password. Please try again.';
        document.querySelector('.login-box').appendChild(errorMessage);
        if (!email.value.trim()) {
            email.style.border = '1px solid red';
        } else {
            email.style.border = '';
        }
        if (!password.value.trim()) {
            password.style.border = '1px solid red';
        } else {
            password.style.border = '';
        }
    } else {
        document.querySelector('form').submit();
    }
});

document.querySelector('.guest-login-btn').addEventListener('click', function(event) {
    event.preventDefault();
    window.location.href = "http://127.0.0.1:5500/modul-10/join/pages/summary.html"; 
});