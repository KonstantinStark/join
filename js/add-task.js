let users = [];
let selectedPrioButton = '';
let subtasksArray = [];
let assignedContacts  = [];

console.log(loadUsers());

function init() {

    prioButtonOnLoad()
    renderDefaultSubtaskLayout()
}

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
                color: responseToJson[key]['color'],
                initials: responseToJson[key]['initials']
            });
        });
    }

    console.log(users);
    renderAssignedToInput();
}

// onchange value merken für checkbox, dass hat den unterschied gemacht

function renderAssignedToInput() {
    let assignedToList = document.getElementById("assigned-to-list");
    assignedToList.innerHTML = "";

    for (let i = 0; i < users.length; i++) {
        let user = users[i];

        assignedToList.innerHTML += /*html*/`
            <div class="assigned-to-list-values" onclick="toggleCheckbox(${user.id})">
                <div class="assigned-to-list-values-image-name">
                    <p>
                        <svg width="40" height="40">
                            <circle cx="20" cy="20" r="16" fill="${user.color}" />
                            <text x="20" y="22" text-anchor="middle" fill="white" font-size="14" font-family="Arial" dy=".35em">
                                ${user.initials}
                            </text>
                        </svg>
                    </p>
                    <p>${user.name}</p>
                </div>
                <input id="checkbox-assign-to-${user.id}" type="checkbox" class="assign-checkbox" value="${user.id}" onchange="getSelectedAssignedUsers()">
            </div>
        `;
    } 
}

// Function to toggle the checkbox state when the assigned-to list div is clicked


function getSelectedAssignedUsers() {
    assignedContacts = [];
    const checkboxes = document.querySelectorAll('.assign-checkbox');
  

    checkboxes.forEach(checkbox => {
        let assignedToValue = checkbox.closest('.assigned-to-list-values');
        
        if (checkbox.checked) {
            assignedContacts.push(checkbox.value);
            assignedToValue.classList.add('bg-color-black');
            assignedToValue.classList.add('.bg-color-black:hover');

        } else {
            assignedToValue.classList.remove('bg-color-black');
        }
    });

  
    
    return assignedContacts;
}

// albert

// function toggleCheckbox(userId) {
//     // Get the checkbox element using the user ID
//     const checkbox = document.getElementById(`checkbox-assign-to-${userId}`);
    
//     // If the checkbox exists, toggle its checked state
//     if (checkbox) {
//         checkbox.checked = !checkbox.checked; // Toggle the checkbox state
        
//         // Call the function to update selected assigned users
//         getSelectedAssignedUsers(); 
//     }
// }


// const user = users.find(u => u.id === contactId); nochmal erklären lassen, hängt aber mit den anderen 2 funktion ab 

function renderAssignedToInputCheckedBelow() {
    let renderAssignedToInputCheckedBelowRef = document.getElementById('assigned-to-input-svg-below');
    renderAssignedToInputCheckedBelowRef.innerHTML = "";  // Clear previous SVGs

    for (let i = 0; i < assignedContacts.length; i++) {
        const contactId = assignedContacts[i];
        const user = users.find(u => u.id === contactId);  // Find the user by ID in `users`

        renderAssignedToInputCheckedBelowRef.innerHTML += /*html*/`
            <svg width="40" height="40">
                            <circle cx="20" cy="20" r="16" fill="${user.color}" />
                            <text x="20" y="22" text-anchor="middle" fill="white" font-size="14" font-family="Arial" dy=".35em">
                                ${user.initials}
                            </text>
            </svg>
        `;
    }
}

// obsidian

function toggleAssignedToList() {
    let toggleAssignedToListRef = document.getElementById('assigned-to-input');
    toggleAssignedToListRef.classList.toggle('d-block'); // Toggles between display states
    
    // Check if the list is now hidden, then render the assigned inputs below
    if (!toggleAssignedToListRef.classList.contains('d-block')) {
        renderAssignedToInputCheckedBelow();
    } else {
        // Optionally, clear or hide the rendered SVGs when the list is open
        document.getElementById('assigned-to-input-svg-below').innerHTML = "";
    }
}


function toggleRenderCategoryInput() {
    let renderCategoryInputToggle = document.getElementById('category-input-content')
    renderCategoryInputToggle.classList.toggle('d-block');
}

function toggleOverlayCreateButton() {
    let toggleOverlayRef = document.getElementById('overlay')
    toggleOverlayRef.classList.toggle('d-none');
}

function prioButtonOnLoad() {

    document.getElementById('medium-button').classList.add('active', 'medium');
}

function setPrioButton(prio) {
    selectedPrioButton = prio;

    document.getElementById('urgent-button').classList.remove('active', 'urgent');
    document.getElementById('medium-button').classList.remove('active', 'medium');
    document.getElementById('low-button').classList.remove('active', 'low');

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
    document.getElementById("assigned-to-list").value = "";
    document.getElementById("due-date-input").value = "";
    document.getElementById("category-input").innerHTML = "Select task category";
    document.getElementById("subtask-input").value = "";
    document.getElementById('urgent-button').classList.remove('active', 'urgent');
    document.getElementById('medium-button').classList.remove('active', 'medium');
    document.getElementById('low-button').classList.remove('active', 'low');

    const checkboxes = document.querySelectorAll('.assign-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.assigned-to-list-values').classList.remove('bg-color-black');
    });

    let toggleAssignedToListRef = document.getElementById('assigned-to-input-svg-below');
    toggleAssignedToListRef.classList.add('d-none');

    prioButtonOnLoad()
    subtasksArray.splice(0, subtasksArray.length);
    renderSubtasks();
    changeCategoryInput(selectedCategory)
}

function changeCategoryInput(selectedCategory) {
    const categoryInputPlaceholderRef = document.getElementById('category-input-placeholder');
    const renderCategoryInputToggle = document.getElementById('category-input-content');
    const placeholderText = 'Select task category';
    
    categoryInputPlaceholderRef.innerHTML = (selectedCategory === placeholderText || selectedCategory === categoryInputPlaceholderRef.innerHTML) 
        ? placeholderText 
        : selectedCategory;
    
    renderCategoryInputToggle.classList.add('d-none');
}

document.getElementById('category-input-placeholder').addEventListener('click', function() {
    changeCategoryInput('Select task category');
});

// subtasks


// document.getElementById('calendar-icon').addEventListener('click', function() {
//     let currentDate = new Date();

//     let day = String(currentDate.getDate()).padStart(2, '0');
//     let month = String(currentDate.getMonth() + 1).padStart(2, '0');
//     let year = currentDate.getFullYear();

//     let formattedDate = `${day}/${month}/${year}`;

//     document.getElementById('due-date-input').value = formattedDate;
// });

document.querySelector('.assigned-to-toggle-button').addEventListener('click', function() {
    let imgElement = this.querySelector('img');
    imgElement.classList.toggle('rotate');
});

function toggleRotate() {
    let img = document.getElementById('category-icon');
    img.classList.toggle('rotate');
}

function validateForm() {
    let dueDate = document.getElementById("due-date-input").value;
    let category = document.getElementById("category-input-placeholder").innerHTML;
    let title = document.getElementById("title-input").value;

    let isValid = true;

    let dueDateInput = document.getElementById("due-date-input");
    let dueDateError = document.getElementById("due-date-error");
    const dueDateTest = dueDateInput.value.trim();
    
    if (dueDate === "" || isNaN(new Date(dueDate).getTime())) {
        dueDateInput.classList.add("error");
        dueDateError.style.display = "block";
        isValid = false;
    } else {
        dueDateInput.classList.remove("error");
        dueDateError.style.display = "none";
    }

    let titleInput = document.getElementById("title-input");
    let titleError = document.getElementById("title-error");
    if (title === "") {
        titleInput.classList.add("error");
        titleError.style.display = "block";
        isValid = false;
    } else {
        titleInput.classList.remove("error");
        titleError.style.display = "none";
    }

    let categoryInput = document.getElementById("category-input");
    let categoryError = document.getElementById("category-error");
    if (category === "Select task category") {
        categoryInput.classList.add("error");
        categoryError.style.display = "block";
        isValid = false;
    } else {
        categoryInput.classList.remove("error");
        categoryError.style.display = "none";
    }

    if (isValid) {
        addNewArrayFromInputs();
        toggleOverlayCreateButton();
    } else {
        console.log("Form is not valid. Please fill in all required fields.");
    }
}

// subtask scheiß  document.getElementById('subtask-input').focus(); sonst konnte man ins input feld nicht tippen, obsidian

function renderEntrySubtask() {
    let subtaskContainer = document.getElementById('subtask-container');
    
    subtaskContainer.innerHTML = /*html*/`
        <div id="subtask-container-js">
            <input type="text" id="subtask-input" name="subtask" placeholder="Subtask" id="subtask-input">
            <div id="subtask-container-js-images">
                <img src="../assets/img/add-task/subtask-check.svg" onclick="addSubtaskToArray()" alt="Add Subtask">
                <img src="../assets/img/add-task/clear.svg" onclick="renderDefaultSubtaskLayout()" alt="Clear Subtask">
            </div>
        </div>
    `;

    // Focus the input field
    document.getElementById('subtask-input').focus();
}

function addSubtaskToArray() {
    let subtaskInput = document.getElementById("subtask-input").value; 
    
    if (subtaskInput) { 
        subtasksArray.push(subtaskInput); 
        document.getElementById("subtask-input").value = ""; 
        renderSubtasks(); 
    }
}

function removeSubtask(index) {
    subtasksArray.splice(index, 1);
    renderSubtasks();
}

function renderSubtasks() {
    let subtasksList = document.getElementById("subtasks-list");
    subtasksList.innerHTML = ""; 

    subtasksArray.forEach((subtask, index) => {
        subtasksList.innerHTML +=  /*html*/ `
        <li class="subtask-list-items" >${subtask} 
        <div class="subtask-list-items-img-wrapper">
        <img src="../assets/img/add-task/pen.svg" onclick="renderSubtasksEdit(${index})" alt="">
        <img onclick="removeSubtask(${index})"src="../assets/img/add-task/subtask-bin.svg" alt="">
        </div>
        
        </li>`;
    });
}

function renderSubtasksEdit() {
    let subtasksList = document.getElementById("subtasks-list");
    subtasksList.innerHTML = ""; 

    subtasksArray.forEach((subtask, index) => {
        subtasksList.innerHTML += /*html*/ `
        <li class="subtask-list-items">
            <input id="edited-input-value-subtask-${index}" type="text" value="${subtask}">
            <div class="edit-images-subtasks-wrapper">
            <img src="/assets/img/add-task/subtask-check.svg" onclick="updateSubtask(${index})" alt="Save">
            <img onclick="removeSubtask(${index})" src="../assets/img/add-task/subtask-bin.svg" alt="Delete">
            </div>
        </li>`;
    });
}

function updateSubtask(index) {
    let editedInputValueSubtaskRef = document.getElementById(`edited-input-value-subtask-${index}`);
    
    if (editedInputValueSubtaskRef) {
        subtasksArray[index] = editedInputValueSubtaskRef.value; // Update the subtasksArray with the new value
        renderSubtasks(); // Re-render the subtasks list
    }
}


function renderDefaultSubtaskLayout() {

    let renderDefaultSubtaskLayoutRef = document.getElementById('subtask-default') 
    renderDefaultSubtaskLayoutRef.innerHTML = "";

    renderDefaultSubtaskLayoutRef.innerHTML = 

    /*html*/`
        
    
    <div class="subtask-input-wrapper">
    <p class="input-headers-margin-bottom">Subtasks</p>
    <div class="subtask-input" id="subtask-container" onclick="renderEntrySubtask()">
      <div id="subtask-input">
        
        Subtask

        <img src="../assets/img/add-task/plus.svg" alt="">
      </div>
      
    </div>
    <div id="subtasks-list">
      <!-- js -->
    </div>
  </div>
  `

} 

function showCalendar() {
    // Focus on the date input field to show the calendar
    document.getElementById("calender-icon").click();
}

function updateDateInput() {
    const dateInput = document.getElementById("calender-icon");
    const formattedDate = new Date(dateInput.value).toLocaleDateString('en-GB'); // Format date to dd/mm/yyyy
    dateInput.value = formattedDate; // Update input with formatted date
}