document.addEventListener("DOMContentLoaded", () => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    const hamburgerToggle = document.getElementById("hamburger-toggle");
    if (userData && userData.initials) {
        hamburgerToggle.textContent = userData.initials;
    } else {
        hamburgerToggle.textContent = "Gst.";
    }
});

function logoutUser() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("isGuest");
    window.location.href = "../pages/login.html";
}

function toggleHamburgerMenu() {
    document.getElementById("hamburger-menu").classList.toggle("d-none");
}

function goBack() {
    history.back();
}