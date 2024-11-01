document.addEventListener("DOMContentLoaded", () => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    const hamburgerToggle = document.getElementById("hamburger-toggle");
    if (userData && userData.initials) {
        hamburgerToggle.textContent = userData.initials;
    } else {
        hamburgerToggle.textContent = "?";
    }
});