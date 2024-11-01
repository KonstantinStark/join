document.addEventListener("DOMContentLoaded", () => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    const hamburgerToggle = document.getElementById("hamburger-toggle");
    
    if (userData && userData.initials) {
        // Initialen im Hamburger-Icon anzeigen
        hamburgerToggle.textContent = userData.initials;
    } else {
        // Optional: Fallback, wenn keine Initialen vorhanden sind
        hamburgerToggle.textContent = "?";
    }
});