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



// obsidian mit comment drunter 


function getSelectedAssignedUsers() {
    const checkboxes = document.querySelectorAll('.assign-checkbox');  // Get all checkboxes
    let assignedContacts  = [];

    checkboxes.forEach(checkbox => {
        let assignedToValue = checkbox.closest('.assigned-to-list-values');   // Get the parent .assigned-to-list-values

        if (checkbox.checked) {
            assignedContacts.push(checkbox.value);  // Store selected contacts
            assignedToValue.classList.add('bg-color-black');  // Add black background class
        } else {
            assignedToValue.classList.remove('bg-color-black');  // Remove black background class if unchecked
        }
    });

    return assignedContacts;  // Return array of selected user values
}



// function getSelectedAssignedUsers() {
//     const checkboxes = document.querySelectorAll('.assign-checkbox:checked');  
//     let assignedToValuesTurnBlack = document.querySelectorAll('assigned-to-list-values');
//     let assignedContacts  = [];

//     checkboxes.forEach(checkbox => {
//         assignedContacts.push(checkbox.value);  
        
//     });

//     assignedToValuesTurnBlack.classList.add('bg-color-black')

//     return assignedContacts;  
   
// }

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

// obsidian 

function changeCategoryInput(selectedCategory) {
    const categoryInputPlaceholderRef = document.getElementById('category-input-placeholder');
    const renderCategoryInputToggle = document.getElementById('category-input-content');
    const placeholderText = 'Select task category';
    
    // Toggle between selected category and resetting to placeholder
    categoryInputPlaceholderRef.innerHTML = (selectedCategory === placeholderText || selectedCategory === categoryInputPlaceholderRef.innerHTML) 
        ? placeholderText 
        : selectedCategory;
    
    // Hide the dropdown after selection
    renderCategoryInputToggle.classList.add('d-none');
}

// Add event listener to reset when clicking on the placeholder
document.getElementById('category-input-placeholder').addEventListener('click', function() {
    changeCategoryInput('Select task category');  // Reset to placeholder when clicking the text
});


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
        subtasksList.innerHTML +=  /*html*/ `
        
        <li>${subtask} 
        <img onclick="removeSubtask(${index})"src="/assets/img/add-task/subtask-bin.svg" alt="">
        <img src="/assets/img/add-task/subtask-check.svg" alt="">
        <img src="/assets/img/add-task/pen.svg" alt="">
        </li>`;
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

function toggleRotate() {
    let img = document.getElementById('category-icon');
    img.classList.toggle('rotate');  // Adds or removes the 'rotate' class to trigger the animation
}


function validateForm() {
    // Get form input values
    let dueDate = document.getElementById("due-date-input").value;
    let category = document.getElementById("category-input-placeholder").innerHTML;
    let title = document.getElementById("title-input").value;

    // Track if the form is valid, default to true, but will be set to false if any validation fails
    let isValid = true;

    // Due date validation
    let dueDateInput = document.getElementById("due-date-input");
    let dueDateError = document.getElementById("due-date-error");
    if (dueDate === "") {
        dueDateInput.classList.add("error");
        dueDateError.style.display = "block";
        isValid = false;  // Mark form as invalid
    } else {
        dueDateInput.classList.remove("error");
        dueDateError.style.display = "none";
    }

    // Title validation
    let titleInput = document.getElementById("title-input");
    let titleError = document.getElementById("title-error");
    if (title === "") {
        titleInput.classList.add("error");
        titleError.style.display = "block";
        isValid = false;  // Mark form as invalid
    } else {
        titleInput.classList.remove("error");
        titleError.style.display = "none";
    }

    // Category validation
    let categoryInput = document.getElementById("category-input");
    let categoryError = document.getElementById("category-error");
    if (category === "Select task category") {
        categoryInput.classList.add("error");
        categoryError.style.display = "block";
        isValid = false;  // Mark form as invalid
    } else {
        categoryInput.classList.remove("error");
        categoryError.style.display = "none";
    }

    // If all fields are valid, execute the functions
    if (isValid) {
        // Proceed to add data and toggle the overlay button only if form is valid
        addNewArrayFromInputs();
        toggleOverlayCreateButton();
    } else {
        console.log("Form is not valid. Please fill in all required fields.");
    }
}
