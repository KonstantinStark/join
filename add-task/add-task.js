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

function getInitialsFromName() {


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

// foreach nochmal gucken

// function populateAssignedToInput() {
//     let assignedToInput = document.getElementById("assigned-to-input");
//     assignedToInput.innerHTML = "";

//     users.forEach(user => {
//         assignedToInput.innerHTML += /*html*/`
//         <option value="${user.id}">
//             ${user.name}
//         </option>
//         `;
//     });
// }

function renderAssignedToInput() {
    let assignedToInput = document.getElementById("assigned-to-input");
    assignedToInput.innerHTML = "";

    for (let i = 0; i < users.length; i++) {
        let user = users[i];

        assignedToInput.innerHTML += /*html*/`
        
            <div class="assigned-to-list" id="assigned-to-list">
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
            </div>
        `;
    }
}

//nochmal gucken//

function getSelectedAssignedUsers() {
    const checkboxes = document.querySelectorAll('.assign-checkbox:checked');  // Get all checked checkboxes
    let assignedContacts  = [];

    checkboxes.forEach(checkbox => {
        assignedContacts.push(checkbox.value);  // Push the user ID into the array
    });

    return assignedContacts;  // Return array of selected user IDs
}

//toogles //


function toggleAssignedToList() {

    let toggleAssignedToListRef = document.getElementById('assigned-to-input')
    toggleAssignedToListRef.classList.toggle('d-block');
}


// function renderCategoryInput() {

//     let renderCategoryInput = document.getElementById("category-input");
//     renderCategoryInput.innerHTML = /*html*/`
        
//         <div id="category-input-content" class="d-none">
//             <p>Technical Task</p>
//             <p>User Story</p>
//         </div>
//     `;

// }

function toggleRenderCategoryInput() {

    let renderCategoryInputToggle = document.getElementById('category-input-content')
    renderCategoryInputToggle.classList.toggle('d-block');
}

//prio-buttons with global variable on top

function setPrioButton(prio) {
    selectedPrioButton  = prio; // Update the global urgency variable
}

// push new data to database


async function addNewArrayFromInputs() {
    let assignedContacts  = getSelectedAssignedUsers();  // Get array of selected user IDs
    
    // Create the task object with the selected user IDs
    let newTask = {
        title: document.getElementById("title-input").value,
        description: document.getElementById("description-input").value,
        assignedContacts : assignedContacts,  // Store array of selected user IDs
        prioButton:selectedPrioButton,
        dueDate: document.getElementById("due-date-input").value,
        category: document.getElementById("category-input-placeholder").innerHTML,
        subtasks: subtasksArray,
    };

    resetInputFields()

    try {
        // Save the task to the database under /tasks (you can adjust the path as needed)
        await postData(`/tasks`, newTask);
        console.log("Task successfully added:", newTask);
    } catch (error) {
        console.error("Error adding task:", error);
    }
}


function resetInputFields() {
    document.getElementById("title-input").value = "";
    document.getElementById("description-input").value = "";
    document.getElementById("assigned-to-input").value = "";
    document.getElementById("assigned-to-list").classList.add("d-none")
    document.getElementById("due-date-input").value = "";
    document.getElementById("category-input").value = "";
    document.getElementById("subtask-input").value = "";
    
    
    
}

function changeCategoryInput(selectedCategory) {
    let categoryInputPlaceholderRef = document.getElementById('category-input-placeholder');
    categoryInputPlaceholderRef.innerHTML = selectedCategory; // Update the placeholder with the selected category
    
    // Optionally hide the dropdown after selection
    let renderCategoryInputToggle = document.getElementById('category-input-content');
    renderCategoryInputToggle.classList.add('d-none');
}

// subtasks

function addSubtaskToArray() {
    let subtaskInput = document.getElementById("subtask-input").value; // Get the subtask input value
    
    if (subtaskInput) { // Only add non-empty values
        subtasksArray.push(subtaskInput); // Add the subtask to the array
        document.getElementById("subtask-input").value = ""; // Clear the input field
        renderSubtasks(); // Update the UI with the new subtasks
    }
}

function renderSubtasks() {
    let subtasksList = document.getElementById("subtasks-list");
    subtasksList.innerHTML = ""; // Clear the list before rendering

    subtasksArray.forEach((subtask, index) => {
        subtasksList.innerHTML += `<li>${subtask} <button onclick="removeSubtask(${index})">Remove</button></li>`;
    });
}

