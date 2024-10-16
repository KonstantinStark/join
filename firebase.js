let users = [];

function init() {
    loadUsers(); 
}

const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";

async function addUser() {
    let nameValue = document.getElementById("name").value;
    let phoneValue = document.getElementById("phone").value;
    let emailValue = document.getElementById("email").value;

    
    let newUser = { name: nameValue, phone: phoneValue, email: emailValue };

   
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";

    
    await postData("/users", newUser);

    
    await loadUsers();
}

async function postData(path = "", data = {}) {
    await fetch(FIREBASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

async function loadUsers(path = '/users') {
    let userResponse = await fetch(FIREBASE_URL + path + '.json');
    let responseToJson = await userResponse.json();
    console.log('Serverantwort', responseToJson);

    users = []; 
    if (responseToJson) {
        Object.keys(responseToJson).forEach(key => {
            users.push({
                id: key,
                name: responseToJson[key]['name'],
                phone: responseToJson[key]['phone'],
                email: responseToJson[key]['email']
            });
        });
        console.log('Users-Array', users);
    }

    
    loadData();
}

function loadData() {
    let contentListRef = document.getElementById("contact-list");
    contentListRef.innerHTML = ""; // Clear the current content

    console.log(users); // Check if users array is populated

    // Loop through all users and add them to the list
    for (let index = 0; index < users.length; index++) {
        let people = users[index];
        contentListRef.innerHTML += /*html*/`
        <div onclick="editContact(${index})"class="content-container-${index}" id="content-container-${index}"> <br>

        <svg width="100"
                 height="100">
                <circle id="circle" cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
                </svg>

            <div class="name-email-contact-list-wrapper">
             <p>${people.name}</p>
             <p>${people.email}</p>
        </div>
             
         </div>
         
        `;
    }
}

function editContact(index) {
    let editContact = document.getElementById('edit-contacts');
    let person = users[index]; // Holen Sie den Benutzer basierend auf dem Array-Index

    editContact.innerHTML = ''; // Clear previous content
    editContact.innerHTML += /*html*/`
   <div id="contact-${index}">
    <div class="svg-name-wrapper">
        <svg width="100"
         height="100">
        <circle id="circle" cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
        </svg>
        <div class="name-delete-edit-wrapper">

        
        <h1>${person.name}</h1>
        <div class="delete-edit-contact-wrapper">
        <span>
        <img src="" alt="">
        <p onclick="editContactTest(${index})">Edit</p>
         </span>
        <span>
        <img src="" alt="">
        <p onclick="deleteContact(${index})">Delete</p>
         </span>
         </div>
        </div>
    </div>
  
    

    <p>Contact Information <br></p>

    <div>
    
    <p><strong>Email: </strong> <br> ${person.email} </p>
    <p><strong>Phone:</strong> <br> ${person.phone}</p>
    </div>
</div>
    `;
}


async function deleteContact(index) {
    let person = users[index]; 
    try {
       
        let response = await fetch(`${FIREBASE_URL}/users/${person.id}.json`, {
            method: "DELETE",
        });

        
        if (response.ok) {
            
            document.getElementById(`contact-${index}`).remove();
            document.getElementById(`content-container-${index}`).remove();
        } else {
            console.error('delete unsuccessful', response.status);
        }
    } catch (error) {
        console.error('error', error);
    }
}



function editContactTest(index) {
    let overlay = document.getElementById('edit-overlay');
    if (overlay.classList.contains('d-none')) {
        overlay.classList.remove('d-none');         
        setTimeout(function() {
            overlay.classList.add('show');
        }, 10);
    } else {
        overlay.classList.remove('show'); 
        setTimeout(function() {
            overlay.classList.add('d-none'); 
        }, 500); 
    }
}

function exitOverlay() {

    let overlay = document.getElementById('edit-overlay');
    overlay.classList.toggle('d-none');
}





