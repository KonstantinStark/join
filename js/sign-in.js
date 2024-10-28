document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");
    const passwordError = document.getElementById("password-error");
    const policyCheckbox = document.getElementById("accept-policy");
    const policyContainer = document.querySelector(".policy-container");
    const policyError = document.createElement("div");
    policyError.style.color = "#ff4d4f";
    policyError.style.display = "none";
    policyError.textContent = "Please accept the Privacy policy.";
    policyContainer.appendChild(policyError);
    form.addEventListener("submit", function (event) {
        if (password.value !== confirmPassword.value) {
            event.preventDefault();
            passwordError.style.display = "block";
            confirmPassword.style.borderColor = "#ff4d4f";
        }
        checkPolicy(event);
    });
    confirmPassword.addEventListener("input", () => {
        if (password.value === confirmPassword.value) {
            passwordError.style.display = "none";
            confirmPassword.style.borderColor = "";
        }
    });
    function checkPolicy(event) {
        if (!policyCheckbox.checked) {
            event.preventDefault();
            policyError.style.display = "block";
        } else {
            policyError.style.display = "none";
        }
    }
});
