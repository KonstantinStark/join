document.addEventListener("DOMContentLoaded", () => {
    const greetingText = document.getElementById("greeting-text"),
        nameElement = document.getElementById("user-name"),
        userData = JSON.parse(localStorage.getItem("loggedInUser")),
        isGuest = localStorage.getItem("isGuest") === "true";
    const getGreeting = () => {
        const hours = new Date().getHours();
        return hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : hours < 22 ? "Good evening" : "Good night";
    };
    greetingText.textContent = isGuest ? getGreeting() : `${getGreeting()}, `;
    if (!isGuest && userData?.name) {
        nameElement.textContent = userData.name;
        nameElement.style.color = "#29abe2";
    }
    setTimeout(() => window.location.href = "summary.html", 3000);
});
