
let selectedPrioButton = '';
let subtasksArray = [];
let assignedContacts  = [];
let isValid = true; // to validate input fields 

/**
 * Loads medium as initial selected prio button and users.
 */
function init() {
    prioButtonOnLoad();
    loadUsers();
}

/**
 * Gets users from the database.
 */
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

/**
 * Shows the calendar.
 */
function showCalendar() {
    document.getElementById("calender-icon").click();
}

/**
 * Updates the date input with formatted date.
 */
function updateDateInput() {
    const dateInput = document.getElementById("calender-icon");
    const formattedDate = new Date(dateInput.value).toLocaleDateString('en-GB');
    dateInput.value = formattedDate;
}

/**
 * Renders the assigned to input field.
 */
function renderAssignedToInput() {
    let assignedToList = document.getElementById("assigned-to-list");
    assignedToList.innerHTML = "";

    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        assignedToList.innerHTML += generateUserHTML(user);
    }
}

/**
 * Toggles the checkbox state and handles clicking on the list item.
 */
function toggleCheckbox(clickedElement) {
    const checkbox = clickedElement.closest('.assigned-to-list-values').querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    getSelectedAssignedUsers();
}

/**
 * Collects all selected users in assignedContacts array, changes background color and returns it.
 */
function getSelectedAssignedUsers() {
    assignedContacts = [];
    const checkboxes = document.querySelectorAll('.assign-checkbox');

    checkboxes.forEach(checkbox => {
        let assignedToValue = checkbox.closest('.assigned-to-list-values');
        
        if (checkbox.checked) {
            const selectedUser = users.find(user => user.id === checkbox.value);
            
            if (selectedUser) {
                assignedContacts.push(selectedUser);
            }

            assignedToValue.classList.add('bg-color-black');
        } else {
            assignedToValue.classList.remove('bg-color-black');
        }
    });

    return assignedContacts;
}

/**
 * Renders the assigned users below the input field.
 */
function renderAssignedToInputCheckedBelow() {
    let renderAssignedToInputCheckedBelowRef = document.getElementById('assigned-to-input-svg-below');
    renderAssignedToInputCheckedBelowRef.innerHTML = "";

    assignedContacts.forEach(assignedContact => {
        if (assignedContact) {
            renderAssignedToInputCheckedBelowRef.innerHTML += generateUserSVG(assignedContact);
        }
    });
}

/**
 * Toggles the assigned to list.
 */
function toggleAssignedToList() {
    let toggleAssignedToListRef = document.getElementById('assigned-to-input');
    toggleAssignedToListRef.classList.toggle('d-block');

    if (!toggleAssignedToListRef.classList.contains('d-block')) {
        renderAssignedToInputCheckedBelow();
    } else {
        document.getElementById('assigned-to-input-svg-below').innerHTML = "";
    }

    document.addEventListener('click', handleClickOutside);
}

/**
 * Closes the assigned to list when clicking outside the container.
 */
function handleClickOutside(event) {
    const assignedToList = document.getElementById('assigned-to-input');
    const toggleButton = document.querySelector('.assigned-to-toggle-button');

    if (!assignedToList.contains(event.target) && !toggleButton.contains(event.target)) {
        assignedToList.classList.remove('d-block');
        renderAssignedToInputCheckedBelow();
        document.removeEventListener('click', handleClickOutside);
    }
}

// Toggles arrow icon when container is clicked
document.querySelector('.assigned-to-toggle-button').addEventListener('click', function() {
    let imgElement = this.querySelector('img');
    imgElement.classList.toggle('rotate');
});

/**
 * Loads the medium priority button on initialization.
 */
function prioButtonOnLoad() {
    document.getElementById('medium-button').classList.add('active', 'medium');
}

/**
 * Sets the priority button.
 */
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

/**
 * Toggles the render category input.
 */
function toggleRenderCategoryInput() {
    let renderCategoryInputToggle = document.getElementById('category-input-content');
    renderCategoryInputToggle.classList.toggle('d-block');
    
    document.addEventListener('click', function(event) {
        const categoryInputWrapper = document.getElementById('category-input');
        if (!categoryInputWrapper.contains(event.target)) {
            renderCategoryInputToggle.classList.remove('d-block');
        }
    });
}

/**
 * Changes the category input.
 */
function changeCategoryInput(selectedCategory) {
    const categoryInputPlaceholderRef = document.getElementById('category-input-placeholder');
    const renderCategoryInputToggle = document.getElementById('category-input-content');
    const placeholderText = 'Select task category';
    
    categoryInputPlaceholderRef.innerHTML = (selectedCategory === placeholderText || selectedCategory === categoryInputPlaceholderRef.innerHTML) 
        ? placeholderText 
        : selectedCategory;
    
    renderCategoryInputToggle.classList.add('d-none');
}

// Toggles arrow icon when container is clicked
document.getElementById('category-input-placeholder').addEventListener('click', function() {
    changeCategoryInput('Select task category');
});

/**
 * Toggles the rotation of the category icon.
 */
function toggleRotate() {
    let img = document.getElementById('category-icon');
    img.classList.toggle('rotate');
}

/**
 * Renders the entry subtask.
 */
function renderEntrySubtask() {
    let subtaskContainer = document.getElementById('subtask-container');
    subtaskContainer.innerHTML = generateEntrySubtaskHTML();
    document.getElementById('subtask-input').focus();
}

/**
 * Adds a subtask to the array.
 */
function addSubtaskToArray() {
    let subtaskInput = document.getElementById("subtask-input").value; 
    
    if (subtaskInput) { 
        subtasksArray.push(subtaskInput); 
        document.getElementById("subtask-input").value = ""; 
        renderSubtasks(); 
    }
}

/**
 * Removes a subtask from the array.
 */
function removeSubtask(index) {
    subtasksArray.splice(index, 1);
    renderSubtasks();
}

/**
 * Renders the subtasks.
 */
function renderSubtasks() {
    let subtasksList = document.getElementById("subtasks-list");
    subtasksList.innerHTML = "";

    subtasksArray.forEach((subtask, index) => {
        subtasksList.innerHTML += generateSubtaskHTML(subtask, index);
    });

    subtasksList.classList.remove('d-none');
}

/**
 * Renders the subtasks for editing.
 */
function renderSubtasksEdit() {
    let subtasksList = document.getElementById("subtasks-list");
    subtasksList.innerHTML = "";

    subtasksArray.forEach((subtask, index) => {
        subtasksList.innerHTML += generateSubtaskEditHTML(subtask, index);
    });
}

/**
 * Updates a subtask in the array.
 */
function updateSubtask(index) {
    let editedInputValueSubtaskRef = document.getElementById(`edited-input-value-subtask-${index}`);
    
    if (editedInputValueSubtaskRef) {
        subtasksArray[index] = editedInputValueSubtaskRef.value;
        renderSubtasks();
    }
}

/**
 * Clears the subtasks array.
 */
function emptySubtaskArrayFull() {
    subtasksArray.splice(0, subtasksArray.length);
    renderSubtasks();

    let subtaskList = document.getElementById('subtasks-list');
    subtaskList.classList.add('d-none');
}

/**
 * Resets the text input fields.
 */
function resetTextInputs() {
    document.getElementById("title-input").value = "";
    document.getElementById("description-input").value = "";
    document.getElementById("assigned-to-input").value = "";
    document.getElementById("assigned-to-list").value = "";
    document.getElementById("due-date-input").value = "";
    document.getElementById("subtask-input").value = "";
}

/**
 * Resets the priority buttons.
 */
function resetPriorityButtons() {
    document.getElementById('urgent-button').classList.remove('active', 'urgent');
    document.getElementById('medium-button').classList.remove('active', 'medium');
    document.getElementById('low-button').classList.remove('active', 'low');
}

/**
 * Resets the assigned contacts.
 */
function resetAssignedContacts() {
    assignedContacts.splice(0, assignedContacts.length);
    renderAssignedToInputCheckedBelow();

    const checkboxes = document.querySelectorAll('.assign-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.assigned-to-list-values').classList.remove('bg-color-black');
    });
}

/**
 * Resets the category placeholder.
 */
function resetCategoryPlaceholder() {
    const categoryInputPlaceholderRef = document.getElementById('category-input-placeholder');
    categoryInputPlaceholderRef.innerHTML = "Select task category";
}

/**
 * Resets the subtasks.
 */
function resetSubtasks() {
    subtasksArray.splice(0, subtasksArray.length);
    renderSubtasks();

    let subtaskList = document.getElementById('subtasks-list');
    subtaskList.classList.add('d-none');
}

/**
 * Resets all input fields.
 */
function resetInputFields() {
    resetTextInputs();
    resetPriorityButtons();
    resetAssignedContacts();
    resetCategoryPlaceholder();
    resetSubtasks();
    prioButtonOnLoad();
}

/**
 * Validates the title input field.
 */
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

/**
 * Validates the due date input field.
 */
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

/**
 * Validates the category input field.
 */
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

/**
 * Validates the entire form.
 */
function validateForm() {
    isValid = true;

    validateDueDate();
    validateTitle();
    validateCategory();

    if (isValid) {
        addNewArrayFromInputs();
    } 
}

/**
 * Transforms the subtasks array to include title and boolean.
 */
function transformSubtasks(subtasksArray) {
    return subtasksArray.map((subtask, index) => {
        return {
            title: subtask,
            boolean: false,
            id: index + 1,
        };
    });
}

/**
 * Takes all inputs and saves them to the database.
 */
async function addNewArrayFromInputs() {
    let assignedContacts  = getSelectedAssignedUsers();

    if(selectedPrioButton === '') {
        selectedPrioButton = 'medium';
    }
    
    let subtasksArrayWithBoolean = transformSubtasks(subtasksArray);

    let newTask = {
        title: document.getElementById("title-input").value,
        description: document.getElementById("description-input").value,
        assignedContacts: assignedContacts,
        prioButton: selectedPrioButton, 
        dueDate: document.getElementById("due-date-input").value,
        category: document.getElementById("category-input-placeholder").innerHTML,
        subtasks: subtasksArrayWithBoolean,
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

/**
 * Posts data to the server.
 */
async function postData(path = "", data = {}) {
    await fetch(FIREBASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}


