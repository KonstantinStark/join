window.onload = function () {
    let logo = document.querySelector('.join-logo-container');
    let loginContainer = document.getElementById('login-container');

    setTimeout(() => {
        logo.classList.add('logo-moved');
    }, 1000);

    setTimeout(() => {
        loginContainer.classList.remove('hidden');
        loginContainer.classList.add('show-login');
    }, 2000);
};