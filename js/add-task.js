
//add task file copied in 
    
let selectedPrioButton = '';
let subtasksArray = [];
let assignedContacts  = [];
let isValid = true; // to validate input fields 


//loads medium as initial seleted prio button

prioButtonOnLoad()
loadUsers()

// get users from database 

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
    renderAssignedToInput();
   

}



// title and desscription get handled at the end of the script addNewArrayFromInputs function, since they dont need fancy functions

// due date calendar functions

function showCalendar() {
    // Focus on the date input field to show the calendar
    document.getElementById("calender-icon").click();
}

function updateDateInput() {
    const dateInput = document.getElementById("calender-icon");
    const formattedDate = new Date(dateInput.value).toLocaleDateString('en-GB'); // Format date to dd/mm/yyyy
    dateInput.value = formattedDate; // Update input with formatted date
}


// function to render assigned to input field

function renderAssignedToInput() {
    let assignedToList = document.getElementById("assigned-to-list");
    assignedToList.innerHTML = ""; // Clear existing content

    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        assignedToList.innerHTML += generateUserHTML(user); // Use the template function
    }
}


// Function to toggle the checkbox state and handle clicking on the list item

function toggleCheckbox(clickedElement) {
    const checkbox = clickedElement.closest('.assigned-to-list-values').querySelector('input[type="checkbox"]');
    
    // Toggle checkbox state
    checkbox.checked = !checkbox.checked;
    
    // Call to update the background color and selected users
    getSelectedAssignedUsers();
}

// Function to collect all selected users in assignedContacts array, change background color and returns it in the end 

function getSelectedAssignedUsers() {
    assignedContacts = []; // Reset the assigned contacts array each time
    const checkboxes = document.querySelectorAll('.assign-checkbox');

    checkboxes.forEach(checkbox => {
        let assignedToValue = checkbox.closest('.assigned-to-list-values');
        
        if (checkbox.checked) {
            // Find the user object based on the checkbox value (ID)
            const selectedUser = users.find(user => user.id === checkbox.value);
            
            if (selectedUser) {
                assignedContacts.push(selectedUser); // Push the full user object into the array
            }

            assignedToValue.classList.add('bg-color-black'); // Add background color for checked checkboxes
        } else {
            assignedToValue.classList.remove('bg-color-black'); // Remove background color for unchecked checkboxes
        }
    });

    return assignedContacts;
}

// Render the assigned users below the input field
function renderAssignedToInputCheckedBelow() {
    let renderAssignedToInputCheckedBelowRef = document.getElementById('assigned-to-input-svg-below');
    renderAssignedToInputCheckedBelowRef.innerHTML = "";  // Clear previous SVGs

    // Iterate over the assignedContacts array and generate SVG for each user
    assignedContacts.forEach(assignedContact => {
        if (assignedContact) {
            renderAssignedToInputCheckedBelowRef.innerHTML += generateUserSVG(assignedContact);
        }
    });
}


// function to toggle the assigned to list 

function toggleAssignedToList() {
    let toggleAssignedToListRef = document.getElementById('assigned-to-input');
    toggleAssignedToListRef.classList.toggle('d-block');

    // Only render the assigned inputs below if the list is hidden
    if (!toggleAssignedToListRef.classList.contains('d-block')) {
        renderAssignedToInputCheckedBelow();
    } else {
        // Clear SVGs if the list is open
        document.getElementById('assigned-to-input-svg-below').innerHTML = "";
    }

    // Add an event listener to close the list when clicking outside of it
    document.addEventListener('click', handleClickOutside);
}

//function to close it when clicking ouside the container

function handleClickOutside(event) {
    const assignedToList = document.getElementById('assigned-to-input');
    const toggleButton = document.querySelector('.assigned-to-toggle-button');

    // Check if the click happened outside the list and the toggle button
    if (!assignedToList.contains(event.target) && !toggleButton.contains(event.target)) {
        assignedToList.classList.remove('d-block'); // Hide the list
        renderAssignedToInputCheckedBelow(); // Render below when hiding the list

        // Remove the event listener after hiding
        document.removeEventListener('click', handleClickOutside);
    }
}

// toggles arrow icon when container is clicked

document.querySelector('.assigned-to-toggle-button').addEventListener('click', function() {
    let imgElement = this.querySelector('img');
    imgElement.classList.toggle('rotate');
});


// functions for the three different priority buttons

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


// category input field functions

function toggleRenderCategoryInput() {
    let renderCategoryInputToggle = document.getElementById('category-input-content');
    renderCategoryInputToggle.classList.toggle('d-block');
    
    // Close the dropdown if clicking outside of the container
    document.addEventListener('click', function(event) {
        const categoryInputWrapper = document.getElementById('category-input');
        if (!categoryInputWrapper.contains(event.target)) {
            renderCategoryInputToggle.classList.remove('d-block'); // Close the dropdown
        }
    });
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

// toggles arrow icon when container is clicked

function toggleRotate() {
    let img = document.getElementById('category-icon');
    img.classList.toggle('rotate');
}


//subtasks functions

function renderEntrySubtask() {
    let subtaskContainer = document.getElementById('subtask-container');
    subtaskContainer.innerHTML = generateEntrySubtaskHTML(); // Use the template function

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
    subtasksList.innerHTML = ""; // Clear previous subtasks

    subtasksArray.forEach((subtask, index) => {
        subtasksList.innerHTML += generateSubtaskHTML(subtask, index); // Use the template function
    });

    // Ensure the subtasks list is visible
    subtasksList.classList.remove('d-none');
}


function renderSubtasksEdit() {
    let subtasksList = document.getElementById("subtasks-list");
    subtasksList.innerHTML = ""; // Clear previous subtasks

    subtasksArray.forEach((subtask, index) => {
        subtasksList.innerHTML += generateSubtaskEditHTML(subtask, index); // Use the template function
    });
}


function updateSubtask(index) {
    let editedInputValueSubtaskRef = document.getElementById(`edited-input-value-subtask-${index}`);
    
    if (editedInputValueSubtaskRef) {
        subtasksArray[index] = editedInputValueSubtaskRef.value; // Update the subtasksArray with the new value
        renderSubtasks(); // Re-render the subtasks list
    }
}

// clears subtasksArray

function emptySubtaskArrayFull() {

    subtasksArray.splice(0, subtasksArray.length);
    renderSubtasks();

    let subtaskList = document.getElementById('subtasks-list')
    subtaskList.classList.add('d-none');

}

// reset functions for all fields

function resetTextInputs() {
    document.getElementById("title-input").value = "";
    document.getElementById("description-input").value = "";
    document.getElementById("assigned-to-input").value = "";
    document.getElementById("assigned-to-list").value = "";
    document.getElementById("due-date-input").value = "";
    document.getElementById("subtask-input").value = "";
}

function resetPriorityButtons() {
    document.getElementById('urgent-button').classList.remove('active', 'urgent');
    document.getElementById('medium-button').classList.remove('active', 'medium');
    document.getElementById('low-button').classList.remove('active', 'low');
}

function resetAssignedContacts() {
    assignedContacts.splice(0, assignedContacts.length);
    renderAssignedToInputCheckedBelow();

    const checkboxes = document.querySelectorAll('.assign-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.assigned-to-list-values').classList.remove('bg-color-black');
    });
}

function resetCategoryPlaceholder() {
    const categoryInputPlaceholderRef = document.getElementById('category-input-placeholder');
    categoryInputPlaceholderRef.innerHTML = "Select task category";
}

function resetSubtasks() {
    subtasksArray.splice(0, subtasksArray.length);
    renderSubtasks();

    let subtaskList = document.getElementById('subtasks-list');
    subtaskList.classList.add('d-none');
}

function resetInputFields() {
    resetTextInputs();
    resetPriorityButtons();
    resetAssignedContacts();
    resetCategoryPlaceholder();
    resetSubtasks();
    prioButtonOnLoad();
}


// validates all inputs which have a labeled as mandatory

function validateTitle() {
    let title = document.getElementById("title-input").value;
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
}

function validateDueDate() {
    let dueDate = document.getElementById("due-date-input").value;
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
}

function validateCategory() {
    let category = document.getElementById("category-input-placeholder").innerHTML;
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
}

function validateForm() {
    // Reset isValid to true for each form validation attempt
    isValid = true;

    // Call validation functions for each field
    validateDueDate();
    validateTitle();
    validateCategory();

    // After validating, check if the form is valid
    if (isValid) {
        addNewArrayFromInputs();
    } 
}

// takes all inputs and saves them to the database

// Function to transform subtasks array to include title and boolean
function transformSubtasks(subtasksArray) {
    return subtasksArray.map(subtask => {
        return {
            title: subtask,   // Each subtask is now the 'title'
            boolean: false    // Defaulting the 'boolean' to false
        };
    });
}

// Usage in the main function
async function addNewArrayFromInputs() {
    let assignedContacts  = getSelectedAssignedUsers();

    if(selectedPrioButton === '') {

        selectedPrioButton = 'medium';
    }
    
    // Use the transformSubtasks function to add 'title' and 'boolean' to each subtask
    let subtasksArrayWithBoolean = transformSubtasks(subtasksArray);

    let newTask = {
        title: document.getElementById("title-input").value,
        description: document.getElementById("description-input").value,
        assignedContacts: assignedContacts,
        prioButton: selectedPrioButton, 
        dueDate: document.getElementById("due-date-input").value,
        category: document.getElementById("category-input-placeholder").innerHTML,
        subtasks: subtasksArrayWithBoolean, // Now contains objects with 'title' and 'boolean'
        boardCategory: "to-do"
    };

    try {
        await postData(`/tasks`, newTask);
        console.log("Task successfully added:", newTask);
    } catch (error) {
        console.error("Error adding task:", error);
    }

    window.location.href = 'board.html';
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


