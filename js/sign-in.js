let signupBtn;

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");
    const passwordError = document.getElementById("password-error");
    const policyCheckbox = document.getElementById("accept-policy");
    const policyContainer = document.querySelector(".policy-container");
    const policyError = document.createElement("div");

    signupBtn = document.getElementById("signup-btn");
    
    const nameRef = document.getElementById('name');
    const nameTextRef = document.getElementById('name-error-text');
    const emailRef = document.getElementById('email');
    const emailTextRef = document.getElementById('email-error-text');

    const nameRegex = /^[a-zA-ZäöüÄÖÜß\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    policyError.style.color = "#ff4d4f";
    policyError.style.display = "none";
    policyError.textContent = "Please accept the Privacy policy.";
    policyContainer.appendChild(policyError);
    
    signupBtn.disabled = true;

    function validateUserInput() {
        let isValid = true;

        nameRef.classList.remove("error");
        emailRef.classList.remove("error");
        passwordError.style.display = "none";
        policyError.style.display = "none";
        nameTextRef.style.display = "none";
        emailTextRef.style.display = "none";
        password.style.borderColor = "";
        confirmPassword.style.borderColor = "";

        if (!nameRef.value) {
            nameRef.classList.add("error");
            nameTextRef.textContent = "Name is required.";
            nameTextRef.style.display = "block";
            isValid = false;
        } else if (!nameRegex.test(nameRef.value)) {
            nameRef.classList.add("error");
            nameTextRef.textContent = "Invalid name format.";
            nameTextRef.style.display = "block";
            isValid = false;
        }

        if (!emailRef.value) {
            emailRef.classList.add("error");
            emailTextRef.textContent = "Email is required.";
            emailTextRef.style.display = "block";
            isValid = false;
        } else if (!emailRegex.test(emailRef.value)) {
            emailRef.classList.add("error");
            emailTextRef.textContent = "Invalid email format.";
            emailTextRef.style.display = "block";
            isValid = false;
        }

        if (!password.value) {
            passwordError.textContent = "Password is required.";
            passwordError.style.display = "block";
            password.style.borderColor = "#ff4d4f";
            isValid = false;
        } else if (!confirmPassword.value) {
            passwordError.textContent = "Please confirm your password.";
            passwordError.style.display = "block";
            confirmPassword.style.borderColor = "#ff4d4f";
            isValid = false;
        } else if (password.value !== confirmPassword.value) {
            passwordError.textContent = "Your passwords don’t match. Please try again.";
            passwordError.style.display = "block";
            confirmPassword.style.borderColor = "#ff4d4f";
            isValid = false;
        }

        if (!policyCheckbox.checked) {
            policyError.style.display = "block";
            isValid = false;
        } else {
            policyError.style.display = "none";
        }

        signupBtn.disabled = !isValid;
        return isValid;
    }

    form.addEventListener("input", validateUserInput);
    policyCheckbox.addEventListener("change", validateUserInput);

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        
        if (validateUserInput()) {
            signupBtn.disabled = true;
        }
    });
});

function pushDataToFirebase() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const memberData = {
        email: email,
        name: name,
        password: password
    };

    fetch(`${FIREBASE_URL}/members.json`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(memberData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log("Erfolgreich gespeichert:", data);
        alert("Erfolgreich registriert!");
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("confirm-password").value = "";
        document.getElementById("accept-policy").checked = false;
        signupBtn.disabled = true;
        window.location.href = "http://127.0.0.1:5500/modul-10/join/pages/login.html";
    })
    .catch(error => {
        console.error("Fehler beim Speichern:", error);
        alert("Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.");
    })
    .finally(() => {
        signupBtn.disabled = false;
    });
}
