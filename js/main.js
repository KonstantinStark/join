/**
 * Initializes the user data display after the document has loaded.
 * Sets the hamburger menu toggle text to the user's initials or "Gst." if not logged in.
 */
document.addEventListener("DOMContentLoaded", () => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    const hamburgerToggle = document.getElementById("hamburger-toggle");
    if (userData && userData.initials) {
        hamburgerToggle.textContent = userData.initials;
    } else {
        hamburgerToggle.textContent = "Gst.";
    }
});

/**
 * Logs the user out by removing user data and guest status from localStorage and redirects to the login page.
 */
function logoutUser() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("isGuest");
    window.location.href = "../pages/login.html";
}

/**
 * Toggles the visibility of the hamburger menu by adding or removing the 'd-none' class.
 */
function toggleHamburgerMenu() {
    document.getElementById("hamburger-menu").classList.toggle("d-none");
}

/**
 * Navigates the user to the previous page in the browser history.
 */
function goBack() {
    history.back();
}