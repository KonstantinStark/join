document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");
    const passwordError = document.getElementById("password-error");
    const policyCheckbox = document.getElementById("accept-policy");
    const policyContainer = document.querySelector(".policy-container");
    const policyError = document.createElement("div");
    const signupBtn = document.getElementById("signup-btn");
    
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
    
    // Button initially disabled
    signupBtn.disabled = true;

    // Validate inputs
    function validateUserInput() {
        let isValid = true;

        // Reset error states
        nameRef.classList.remove("error");
        emailRef.classList.remove("error");
        passwordError.style.display = "none";
        policyError.style.display = "none";
        nameTextRef.style.display = "none";
        emailTextRef.style.display = "none";
        password.style.borderColor = "";
        confirmPassword.style.borderColor = "";

        // Validate Name
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

        // Validate Email
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

        // Validate Passwords Match
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

        // Check if the policy is accepted
        if (!policyCheckbox.checked) {
            policyError.style.display = "block";
            isValid = false;
        } else {
            policyError.style.display = "none"; // Clear error if policy is accepted
        }

        // Enable button if all fields are valid
        signupBtn.disabled = !isValid;
        return isValid;
    }

    // Event listeners for real-time validation
    form.addEventListener("input", validateUserInput);
    policyCheckbox.addEventListener("change", validateUserInput);

    form.addEventListener("submit", function (event) {
        if (!validateUserInput()) {
            event.preventDefault();
        }
    });
});


// URL zu deiner Firebase-Datenbank
const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";

// Funktion, um Daten in Firebase zu speichern
function pushDataToFirebase(event) {
    // Verhindere das Standard-Formularverhalten
    event.preventDefault();

    // Erfasse die Eingabedaten
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const acceptPolicy = document.getElementById("accept-policy").checked;

    // Überprüfe, ob die Passwörter übereinstimmen
    if (password !== confirmPassword) {
        document.getElementById("password-error").style.display = "block";
        return; // Beende die Funktion, wenn die Passwörter nicht übereinstimmen
    } else {
        document.getElementById("password-error").style.display = "none";
    }

    // Überprüfe, ob die Datenschutzrichtlinie akzeptiert wurde
    if (!acceptPolicy) {
        document.getElementById("policy-error-text").style.display = "block";
        return;
    } else {
        document.getElementById("policy-error-text").style.display = "none";
    }

    // Erstelle ein Objekt mit den Formulardaten
    const memberData = {
        email: email,
        name: name,
        password: password
    };

    // Sende die Daten an Firebase
    fetch(`${FIREBASE_URL}/members.json`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(memberData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Erfolgreich gespeichert:", data);
        alert("Erfolgreich registriert!");
    })
    .catch(error => {
        console.error("Fehler beim Speichern:", error);
        alert("Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.");
    });
}
