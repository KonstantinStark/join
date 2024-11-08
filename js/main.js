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
    // Benutzerdaten aus dem localStorage entfernen
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("isGuest");

    // Weiterleitung zur Login-Seite
    window.location.href = "../pages/login.html";
}

function toggleHamburgerMenu() {
    document.getElementById("hamburger-menu").classList.toggle("d-none");
}