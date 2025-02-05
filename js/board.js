const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";
let loadedTasks = [];
let users = [];

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    const searchInput = document.getElementById('task-search');
    searchInput.addEventListener('keyup', function () {
        searchTasksByTitle(this.value);
    });
});


async function renderTasks(boardElementId, boardTasks) {
    let boardElement = document.getElementById(boardElementId);
    let boardTitle = boardElement.getAttribute("title");
    if (boardTasks.length === 0) {
        boardElement.innerHTML = `
            <div class="no-tasks">
                <img src="../assets/img/notasks.png" alt="No tasks ${boardTitle}">
            </div>`;
    } else {
        await renderTasksThatExist(boardElement, boardTasks);
    }
}

function renderTasks(tasks) {
    const todoContainer = document.getElementById("todo-tasks");
    const inProgressContainer = document.getElementById("in-progress-tasks");
    const awaitFeedbackContainer = document.getElementById("await-feedback-tasks");
    const doneContainer = document.getElementById("done-tasks");

    renderTasksForContainer(todoContainer, tasks.filter(task => task.prioButton === 'todo'));
    renderTasksForContainer(inProgressContainer, tasks.filter(task => task.prioButton === 'in-progress'));
    renderTasksForContainer(awaitFeedbackContainer, tasks.filter(task => task.prioButton === 'await-feedback'));
    renderTasksForContainer(doneContainer, tasks.filter(task => task.prioButton === 'done'));
}

async function loadTasks() {
    try {
        const tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
        const responseToJson = await tasksResponse.json();
        const tasks = [];

        if (responseToJson) {
            Object.keys(responseToJson).forEach(key => {
                tasks.push({ id: key, ...responseToJson[key] });
            });
        }

        loadedTasks = tasks;
        renderTasks(tasks);
    } catch (error) {
        console.error("Fehler beim Laden der Aufgaben:", error);
    }
}

function searchTasksByTitle(searchTerm) {
    if (searchTerm) {
        const filteredTasks = loadedTasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        renderTasks(filteredTasks);
    } else {
        renderTasks(loadedTasks);
    }
}

function toggleOverlayTaks(taskId) {
    const overlay = document.getElementById("task-overlay");
    if (taskId) {
        const task = loadedTasks.find(task => task.id === taskId);
        if (task) {
            document.getElementById("overlay-category").textContent = task.category;
            document.getElementById("overlay-title").textContent = task.title;
            document.getElementById("overlay-description").textContent = task.description;
            document.getElementById("overlay-due-date").textContent = task.dueDate;
            document.getElementById("overlay-priority").textContent = task.priority;
            const assignedContactsContainer = document.getElementById("overlay-assignedContacts");
            assignedContactsContainer.innerHTML = task.assignedContacts
                ? task.assignedContacts.map(contact => `<span style="background-color: ${getColorForUser(contact)};">${contact}</span>`).join('')
                : "No contacts assigned";
            const subtasksContainer = document.getElementById("overlay-subtasks");
            subtasksContainer.innerHTML = task.subtasks
                ? task.subtasks.map(subtask => `<li><input type="checkbox" ${subtask.completed ? 'checked' : ''}> ${subtask.name}</li>`).join('')
                : "<li>No subtasks</li>";
            const overlayActionsContainer = document.getElementById("overlay-actions");
            overlayActionsContainer.innerHTML = `
                <button onclick="deleteTask('${task.id}')">🗑️ Delete</button>
                <button onclick="editTask('${task.id}')">✏️ Edit</button>
            `;
            overlay.style.display = "flex";
        }
    } else {
        overlay.style.display = "none";
    }
}

function getColorForUser(user) {
    const colors = {
        "Sven Väth": "#FF5733",
        "Anastasia": "#33FF57",
    };
    return colors[user] || "#000000";
}

function drag(event) {
    event.dataTransfer.setData("taskId", event.target.id);
}

function dropTask(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    const taskElement = document.getElementById(taskId);

    const oldColumn = taskElement.closest('.board-tasks');
    const newColumn = event.target.closest('.board-tasks');
    if (!newColumn) return;

    const newColumnId = newColumn.id;

    let newPrioButton;
    switch (newColumnId) {
        case 'todo-tasks':
            newPrioButton = 'todo';
            break;
        case 'in-progress-tasks':
            newPrioButton = 'in-progress';
            break;
        case 'await-feedback-tasks':
            newPrioButton = 'await-feedback';
            break;
        case 'done-tasks':
            newPrioButton = 'done';
            break;
        default:
            console.error("Ungültige Zielspalte:", newColumnId);
            return;
    }

    newColumn.appendChild(taskElement);

    updateTaskStatus(taskId.replace('task-', ''), newPrioButton)
        .then(() => {
            console.log(`Task ${taskId} erfolgreich aktualisiert.`);
            renderTasksForContainer(oldColumn, loadedTasks.filter(task => task.prioButton === oldColumn.id.replace('-tasks', '')));
            renderTasksForContainer(newColumn, loadedTasks.filter(task => task.prioButton === newPrioButton));
        })
        .catch(error => {
            console.error("Fehler beim Speichern der Verschiebung:", error);
            alert("Fehler beim Speichern der Verschiebung. Bitte erneut versuchen.");
            loadTasks();
        });
}

function renderTasksForContainer(container, tasks) {
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="no-tasks">
                <img src="../assets/img/notasks.png" alt="No tasks">
            </div>`;
    } else {
        container.innerHTML = ''; // Clear the container before rendering tasks
        tasks.forEach(task => {
            container.innerHTML += /*html*/`
            <div onclick="toggleOverlayTaks('${task.id}')" class="task-card" id="task-${task.id}" draggable="true" ondragstart="drag(event)">
                <div class="task-header">
                    <span class="task-type ${task.category.toLowerCase().replace(' ', '-')}">${task.category}</span>
                </div>
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <div class="task-progress">
                    <progress value="${task.subtasks ? task.subtasks.length : 0}" max="2"></progress>
                    <span>${task.subtasks ? task.subtasks.length : 0}/2 Subtasks</span>
                </div>
                <div class="task-members">
                    ${task.assignedContacts ? task.assignedContacts.map(contact => `<span class="member" style="background-color: ${getColorForUser(contact)};">${contact}</span>`).join('') : ''}
                </div>
            </div>
            `;
        });
    }
}

async function updateTaskStatus(taskId, newStatus) {
    const taskIndex = loadedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        loadedTasks[taskIndex].prioButton = newStatus;
    }
    try {
        const response = await fetch(`${FIREBASE_URL}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prioButton: newStatus })
        });
        if (!response.ok) {
            throw new Error(`Fehler beim Aktualisieren in Firebase: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Task-Status:", error);
        throw error; 
    }
}

async function deleteTask(taskId) {
    try {
        await fetch(`${FIREBASE_URL}/tasks/${taskId}.json`, {
            method: 'DELETE',
        });
        loadedTasks = loadedTasks.filter(task => task.id !== taskId);
        const taskElement = document.getElementById(`task-${taskId}`);
        if (taskElement) {
            taskElement.remove();
        }
        toggleOverlayTaks();
        console.log(`Task with ID ${taskId} successfully deleted.`);
    } catch (error) {
        console.error('Error deleting the task:', error);
        alert('Error deleting the task. Please try again.');
    }
}

function editTask(taskId) {
    const task = loadedTasks.find(task => task.id === taskId);
    if (task) {
        document.getElementById('title-input').value = task.title;
        document.getElementById('description-input').value = task.description;
        document.getElementById('due-date-input').value = task.dueDate;
        document.getElementById('category-input-placeholder').textContent = task.category;
        toggleOverlayTaks();
        const updatedTask = {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            category: task.category,
            priority: task.priority,
            subtasks: task.subtasks,
            assignedContacts: task.assignedContacts
        };

        updateTaskInFirebase(task.id, updatedTask);
    }
}

async function updateTaskInFirebase(taskId, updatedTask) {
    try {
        const response = await fetch(`${FIREBASE_URL}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask),
        });

        if (response.ok) {
            console.log(`Task mit ID ${taskId} erfolgreich bearbeitet.`);
            loadTasks(); 
        } else {
            throw new Error('Fehler beim Aktualisieren des Tasks');
        }
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Tasks:', error);
        alert('Fehler beim Bearbeiten des Tasks. Bitte erneut versuchen.');
    }
}

function drag(event) {
    event.dataTransfer.setData("taskId", event.target.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function dropTask(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    const taskElement = document.getElementById(taskId);

    const oldColumn = taskElement.closest('.board-tasks');
    const newColumn = event.target.closest('.board-tasks');
    if (!newColumn) return;

    const newColumnId = newColumn.id;

    let newPrioButton;
    switch (newColumnId) {
        case 'todo-tasks':
            newPrioButton = 'todo';
            break;
        case 'in-progress-tasks':
            newPrioButton = 'in-progress';
            break;
        case 'await-feedback-tasks':
            newPrioButton = 'await-feedback';
            break;
        case 'done-tasks':
            newPrioButton = 'done';
            break;
        default:
            console.error("Ungültige Zielspalte:", newColumnId);
            return;
    }

    newColumn.appendChild(taskElement);

    updateTaskStatus(taskId.replace('task-', ''), newPrioButton)
        .then(() => {
            console.log(`Task ${taskId} erfolgreich aktualisiert.`);
            renderTasksForContainer(oldColumn, loadedTasks.filter(task => task.prioButton === oldColumn.id.replace('-tasks', '')));
            renderTasksForContainer(newColumn, loadedTasks.filter(task => task.prioButton === newPrioButton));
        })
        .catch(error => {
            console.error("Fehler beim Speichern der Verschiebung:", error);
            alert("Fehler beim Speichern der Verschiebung. Bitte erneut versuchen.");
            loadTasks();
        });
}

//add task board only

function hideTaskOverlay() {

    document.getElementById("taskOverlay").style.display = "none";
}

function showTaskOverlay() {
    document.getElementById("taskOverlay").style.display = "flex";
}




//add task file copied in 
    
let selectedPrioButton = '';
let subtasksArray = [];
let assignedContacts  = [];
let isValid = true; // to validate input fields 

console.log(loadUsers());

//loads medium as initial seleted prio button

function init() {

    prioButtonOnLoad()
    
}

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
    assignedContacts = [];
    const checkboxes = document.querySelectorAll('.assign-checkbox');

    checkboxes.forEach(checkbox => {
        let assignedToValue = checkbox.closest('.assigned-to-list-values');
        
        if (checkbox.checked) {
            assignedContacts.push(checkbox.value);
            assignedToValue.classList.add('bg-color-black'); // Add bg color for checked checkbox
        } else {
            assignedToValue.classList.remove('bg-color-black'); // Remove bg color for unchecked checkbox
        }
    });

    return assignedContacts;
}

// takes the global assignedContacts array and renders the selected users below the input field

function renderAssignedToInputCheckedBelow() {
    let renderAssignedToInputCheckedBelowRef = document.getElementById('assigned-to-input-svg-below');
    renderAssignedToInputCheckedBelowRef.innerHTML = "";  // Clear previous SVGs

    for (let i = 0; i < assignedContacts.length; i++) {
        const contactId = assignedContacts[i];
        const user = users.find(u => u.id === contactId);  // Find the user by ID in `users`

        if (user) {
            renderAssignedToInputCheckedBelowRef.innerHTML += generateUserSVG(user); // Use the SVG template function
        }
    }
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

// add task templates

function generateUserHTML(user) {
    return /*html*/ `
        <div class="assigned-to-list-values" data-user-id="${user.id}">
            <div class="assigned-to-list-values-image-name" onclick="toggleCheckbox(this)">
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

function generateUserSVG(user) {
    return /*html*/ `
        <svg width="40" height="40">
            <circle cx="20" cy="20" r="16" fill="${user.color}" />
            <text x="20" y="22" text-anchor="middle" fill="white" font-size="14" font-family="Arial" dy=".35em">
                ${user.initials}
            </text>
        </svg>
    `;
}

function generateEntrySubtaskHTML() {
    return /*html*/ `
        <div id="subtask-container-js">
            <input type="text" id="subtask-input" name="subtask" placeholder="Subtask" id="subtask-input">
            <div id="subtask-container-js-images">
            <img src="../assets/img/add-task/clear.svg" onclick="emptySubtaskArrayFull()" alt="Clear Subtask">
            <div class="subtask-container-js-images-devider"></div>
            <img src="../assets/img/add-task/subtask-check.svg" onclick="addSubtaskToArray()" alt="Add Subtask">  
            </div>
        </div>
    `;
}

function generateSubtaskHTML(subtask, index) {
    return /*html*/ `
        <li class="subtask-list-items">${subtask} 
            <div class="subtask-list-items-img-wrapper">
                <img src="../assets/img/add-task/pen.svg" onclick="renderSubtasksEdit(${index})" alt="Edit Subtask">
                <div class="subtask-container-js-images-devider"></div>
                <img src="../assets/img/add-task/subtask-bin.svg" onclick="removeSubtask(${index})" alt="Remove Subtask">
            </div>
        </li>
    `;
}

function generateSubtaskEditHTML(subtask, index) {
    return /*html*/ `
        <li class="subtask-list-items">
            <input id="edited-input-value-subtask-${index}" type="text" value="${subtask}">
            <div class="edit-images-subtasks-wrapper">
                <img src="../assets/img/add-task/subtask-bin.svg" onclick="removeSubtask(${index})" alt="Delete">
                <div class="subtask-container-js-images-devider"></div>
                <img src="../assets/img/add-task/subtask-check.svg" onclick="updateSubtask(${index})" alt="Save">
               
            </div>
        </li>
    `;
}