let users = [];
let selectedPrioButton = '';
let subtasksArray = [];

console.log(loadUsers());

async function loadUsers() {
    let userResponse = await fetch(FIREBASE_URL + '/users.json');
    let responseToJson = await userResponse.json();

    users = [];
    if (responseToJson) {
        Object.keys(responseToJson).forEach(key => {
            users.push({
                id: key,
                name: responseToJson[key]['name'],
                email: responseToJson[key]['email'],
                color: responseToJson[key]['color'] 
            });
        });
    }

    console.log(users);
    renderAssignedToInput();
}

// function getInitialsFromName() {


// }

function renderAssignedToInput() {
    let assignedToList = document.getElementById("assigned-to-list");
    assignedToList.innerHTML = ""; // Clear previous content

    for (let i = 0; i < users.length; i++) {
        let user = users[i];

        // Add user details inside the single assigned-to-list container
        assignedToList.innerHTML += /*html*/`
            <div class="assigned-to-list-values">
                <div class="assigned-to-list-values-image-name">
                    <p>
                        <svg width="50" height="50">
                            <circle id="circle" cx="25" cy="25" r="20" fill="${user.color}" />
                        </svg>
                    </p>
                    <p>${user.name}</p>
                </div>
                <input id="checkbox-assign-to-${user.name}" type="checkbox" class="assign-checkbox" value="${user.name}">
            </div>
        `;
    }
}



function getSelectedAssignedUsers() {
    const checkboxes = document.querySelectorAll('.assign-checkbox:checked');  
    let assignedContacts  = [];

    checkboxes.forEach(checkbox => {
        assignedContacts.push(checkbox.value);  
        
    });

    return assignedContacts;  

    
}

//toogles //


function toggleAssignedToList() {

    let toggleAssignedToListRef = document.getElementById('assigned-to-input')
    toggleAssignedToListRef.classList.toggle('d-block');
}


function toggleRenderCategoryInput() {

    let renderCategoryInputToggle = document.getElementById('category-input-content')
    renderCategoryInputToggle.classList.toggle('d-block');
}

function toggleOverlayCreateButton() {

    let toggleOverlayRef = document.getElementById('overlay')
    toggleOverlayRef.classList.toggle('d-none');
}



//prio-buttons with global variable on top
// obsidian
function setPrioButton(prio) {
    selectedPrioButton = prio; // Update the global variable

    // Remove active class from all buttons
    document.getElementById('urgent-button').classList.remove('active', 'urgent');
    document.getElementById('medium-button').classList.remove('active', 'medium');
    document.getElementById('low-button').classList.remove('active', 'low');

    // Apply the correct class based on the priority selected
    if (prio === 'urgent') {
        document.getElementById('urgent-button').classList.add('active', 'urgent');
    } else if (prio === 'medium') {
        document.getElementById('medium-button').classList.add('active', 'medium');
    } else if (prio === 'low') {
        document.getElementById('low-button').classList.add('active', 'low');
    }
}


async function addNewArrayFromInputs() {
    let assignedContacts  = getSelectedAssignedUsers();  
    
    
    let newTask = {
        title: document.getElementById("title-input").value,
        description: document.getElementById("description-input").value,
        assignedContacts : assignedContacts,  
        prioButton:selectedPrioButton,
        dueDate: document.getElementById("due-date-input").value,
        category: document.getElementById("category-input-placeholder").innerHTML,
        subtasks: subtasksArray,
    };

    resetInputFields()

    try {
        // save the task from newTask array to the database under /tasks 
        await postData(`/tasks`, newTask);
        console.log("Task successfully added:", newTask);
    } catch (error) {
        console.error("Error adding task:", error);
    }
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

function resetInputFields() {
    document.getElementById("title-input").value = "";
    document.getElementById("description-input").value = "";
    document.getElementById("assigned-to-input").value = "";
    document.getElementById("assigned-to-list").classList.add("d-none")
    document.getElementById("due-date-input").value = "";
    document.getElementById("category-input").value = "";
    document.getElementById("subtask-input").value = "";
    document.getElementById('urgent-button').classList.remove('active', 'urgent');
    document.getElementById('medium-button').classList.remove('active', 'medium');
    document.getElementById('low-button').classList.remove('active', 'low');
    
}

function changeCategoryInput(selectedCategory) {
    let categoryInputPlaceholderRef = document.getElementById('category-input-placeholder');
    categoryInputPlaceholderRef.innerHTML = selectedCategory; 
    

    let renderCategoryInputToggle = document.getElementById('category-input-content');
    renderCategoryInputToggle.classList.add('d-none');
}

// subtasks

function addSubtaskToArray() {
    let subtaskInput = document.getElementById("subtask-input").value; 
    
    if (subtaskInput) { 
        subtasksArray.push(subtaskInput); 
        document.getElementById("subtask-input").value = ""; 
        renderSubtasks(); 
    }
}

function renderSubtasks() {
    let subtasksList = document.getElementById("subtasks-list");
    subtasksList.innerHTML = ""; 

    subtasksArray.forEach((subtask, index) => {
        subtasksList.innerHTML += `<li>${subtask} <button onclick="removeSubtask(${index})">Remove</button></li>`;
    });
}

// obsidian 

document.getElementById('calendar-icon').addEventListener('click', function() {
    let currentDate = new Date();

    let day = String(currentDate.getDate()).padStart(2, '0');
    let month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    let year = currentDate.getFullYear();

    let formattedDate = `${day}/${month}/${year}`;

    document.getElementById('due-date-input').value = formattedDate;
});

// to toggle the arrow 180 degrees 

document.querySelector('.assigned-to-toggle-button').addEventListener('click', function() {
    let imgElement = this.querySelector('img');
    imgElement.classList.toggle('rotate');
});



