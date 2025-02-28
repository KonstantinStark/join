
let editAssignedUsersfromCheckboxes = [];
let editSubtaskArray = [];
let taskID;
let editSelectedPrioButton  = '';
// toggles arrow icon when container is clicked

// function toggleRotate() {
//     let img = document.getElementById('category-icon');
//     img.classList.toggle('rotate');
// }


function hideEditTaskOverlay() {

    document.getElementById("editTaskOverlay").classList.toggle("d-none");
}

function showEditTaskOverlay(taskID) {

    document.getElementById("editTaskOverlay").classList.toggle("d-none");

    //remove checkboxes from assigned to list
    resetAssignedUsersCheckboxes();
    

    const task = loadedTasks.find(t => t.id === taskID);

   
    editRenderEditTaskOverlayContentFromDatabase(task);

    
}

function editRenderEditTaskOverlayContentFromDatabase(task) {
    document.getElementById("edit-title-input").value = task.title;
    document.getElementById("edit-description-input").value = task.description;
    document.getElementById("edit-due-date-input").value = task.dueDate;
    editSetPrioButton(task.prioButton);
    document.getElementById('edit-category-input-placeholder').innerHTML = task.category;
    editAssignUsersFromDatabase(task.assignedContacts);
    editSubtasksFromDatabase(task.subtasks);

    renderFooter(task);
   
}


function editToggleAssignedToList() {
    let toggleAssignedToListRef = document.getElementById('edit-assigned-to-container');
    toggleAssignedToListRef.classList.toggle('d-none');

    let editRenderUserSvgRef = document.getElementById('edit-render-assigned-svg');
    editRenderUserSvgRef.classList.toggle('d-none');
}

function editRenderAssignedToUsersList() {
    let assignedToListRef = document.getElementById("edit-assigned-to-list");
    assignedToListRef.innerHTML = ""; // Clear existing content

    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        assignedToListRef.innerHTML += editRenderAssignedToUsersListTemplate(user); // Use the template function

    }
}
function editRenderAssignedToUsersListTemplate(user) {
    return /*html*/ `
        <label for="checkbox-${user.id}">
            <div class="assigned-to-list-values" id="assigned-list-items-${user.id}">
                <div class="assigned-to-list-values-image-name" >
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
                    
            
                <!-- Wrap user.id in quotes to pass it as a string -->
                <input 
                    type="checkbox" 
                    id="checkbox-${user.id}" 
                    class="assigned-to-checkboxes" 
                    value="${user.id}" 
                    onchange="editCheckedAssignedUsers('${user.id}')"> <!-- Pass user.id as a string -->

         </div>
        </label>
    `;
}

function editCheckedAssignedUsers(userId) {
    let checkBox = document.getElementById(`checkbox-${userId}`);

    if (checkBox.checked == true) {

        addUserToAssignedArray(userId);
        editChangeBackgroundColor(userId, true);

    } else {
        
        removeUserFromAssignedArray(userId);
        editChangeBackgroundColor(userId, false);
    }

    editRenderUserSvg();
}

// Function to add the user to the assigned users array
function addUserToAssignedArray(userId) {
    let checkedUser = users.find(user => user.id === userId);

    if (checkedUser && !editAssignedUsersfromCheckboxes.includes(checkedUser)) {
        editAssignedUsersfromCheckboxes.push(checkedUser);
    }
}

// Function to remove the user from the assigned users array
function removeUserFromAssignedArray(userId) {
    let checkedUserIndex = editAssignedUsersfromCheckboxes.findIndex(user => user.id === userId);

    if (checkedUserIndex !== -1) {
        editAssignedUsersfromCheckboxes.splice(checkedUserIndex, 1);
    }
}

function editChangeBackgroundColor(userId, isChecked) {
    let assignedListItem = document.getElementById(`assigned-list-items-${userId}`);
    
    if (assignedListItem) {
        if (isChecked) {
            assignedListItem.classList.add('bg-color-black');
        } else {
            assignedListItem.classList.remove('bg-color-black');
        }
    }
}

function editRenderUserSvg() {
    let editRenderUserSvgRef = document.getElementById('edit-render-assigned-svg');
    editRenderUserSvgRef.innerHTML = "";  

    editAssignedUsersfromCheckboxes.forEach(user => {
        if (user) {
            editRenderUserSvgRef.innerHTML += editRenderUserSvgTemplate(user);
        }
    });
}

function editRenderUserSvgTemplate(user) {
    return /*html*/ `
        <svg width="40" height="40">
            <circle cx="20" cy="20" r="16" fill="${user.color}" />
            <text x="20" y="22" text-anchor="middle" fill="white" font-size="14" font-family="Arial" dy=".35em">
                ${user.initials}
            </text>
        </svg>
    `;
}

function resetAssignedUsersCheckboxes() {
    editAssignedUsersfromCheckboxes = [];

    let checkboxes = document.querySelectorAll('.assigned-to-checkboxes');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false; 
        
        const userId = checkbox.value;

        editChangeBackgroundColor(userId, false); 
    });
}

 // Append assignedContacts to the array if not already in editAssignedUsersfromCheckboxes

function editAssignUsersFromDatabase(assignedContactsFromTask) {
    
    editAssignedUsersfromCheckboxes = [...assignedContactsFromTask];

    assignedContacts.forEach(contact => {
        if (!editAssignedUsersfromCheckboxes.some(user => user.id === contact.id)) {
            editAssignedUsersfromCheckboxes.push(contact);
        }
    });

    editRenderVisualsForAssignedUsersfromDatabase();
}

function editRenderVisualsForAssignedUsersfromDatabase() {
    editAssignedUsersfromCheckboxes.forEach(user => {
        let checkBox = document.getElementById(`checkbox-${user.id}`);

        if (checkBox) {
            checkBox.checked = true; 
        }
        editChangeBackgroundColor(user.id, true);
    });

    editRenderUserSvg();
}

// low, medium, urgent buttons functionality

function editSetPrioButton(editPrio) {
    editSelectedPrioButton = editPrio;

    document.getElementById('edit-urgent-button').classList.remove('active', 'urgent');
    document.getElementById('edit-medium-button').classList.remove('active', 'medium');
    document.getElementById('edit-low-button').classList.remove('active', 'low');

    if (editPrio === 'urgent') {
        document.getElementById('edit-urgent-button').classList.add('active', 'urgent');
    } else if (editPrio  === 'medium') {
        document.getElementById('edit-medium-button').classList.add('active', 'medium');
    } else if (editPrio  === 'low') {
        document.getElementById('edit-low-button').classList.add('active', 'low');
    }
}

// category input field functions

function editToggleRenderCategoryInput() {
    let renderCategoryInputToggle = document.getElementById('edit-category-input-content');
    renderCategoryInputToggle.classList.toggle('d-block');
    
    // Close the dropdown if clicking outside of the container
    document.addEventListener('click', function(event) {
        const categoryInputWrapper = document.getElementById('edit-category-input');
        if (!categoryInputWrapper.contains(event.target)) {
            renderCategoryInputToggle.classList.remove('d-block'); // Close the dropdown
        }
    });
}

function editChangeCategoryInput(editSelectedCategory) {
    const categoryInputPlaceholderRef = document.getElementById('edit-category-input-placeholder');
    const renderCategoryInputToggle = document.getElementById('edit-category-input-content');
    const placeholderText = 'Select task category';
    
    categoryInputPlaceholderRef.innerHTML = (editSelectedCategory === placeholderText || editSelectedCategory  === categoryInputPlaceholderRef.innerHTML) 
        ? placeholderText 
        : editSelectedCategory;
    
    renderCategoryInputToggle.classList.add('d-none');
}

document.getElementById('edit-category-input-placeholder').addEventListener('click', function() {
    editChangeCategoryInput('Select task category');
});

//subtasks functions


function editAddSubtaskInputToArray() {
    // Get the value from the input field
    let renderSubtaskListRef = document.getElementById('editSubtaskInput');
    let subtaskValue = renderSubtaskListRef.value.trim(); // .trim() removes extra spaces

    // Check if the value is not empty
    if (subtaskValue) {
        // Create an object to represent the subtask with title, completed set to false by default, and a unique id
        let newSubtask = { 
            id: editSubtaskArray.length + 1, // Create a unique id (using length here to increment id)
            title: subtaskValue, 
            boolean: false 
        };

        // Push the new subtask to the array
        editSubtaskArray.push(newSubtask);

        // Clear the input field
        renderSubtaskListRef.value = '';
    }

    // Re-render the list of subtasks
    editRenderSubtaskInputEntrys();
}

function editRenderSubtaskInputEntrys() {
    let renderSubtaskInputEntrysRef = document.getElementById('editSubtaskList');
    
    // Initialize a string to accumulate the list items
    let subtasks = '';
    
    // Loop through the array using a traditional for loop
    for (let i = 0; i < editSubtaskArray.length; i++) {
        let subtask = editSubtaskArray[i];
        subtasks += renderSubtaskInputEntrysTemplate(subtask); // Append each subtask's HTML to the string
    }

    // Render the list template with the accumulated subtasks
    renderSubtaskInputEntrysRef.innerHTML = subtasks;  // Set the final innerHTML with all subtasks
}

// Render each individual subtask as HTML
function renderSubtaskInputEntrysTemplate(subtask) {
    return /*html*/ `
        <div class="edit-subtask-list-items" id="editSubtaskListItems-${subtask.id}">
            <ul>
                <li class="edit-subtask-list-items-single">
                    <span>${subtask.title}</span>
                    <div class="edit-subtask-list-items-single-imgs">
                        <img src="../assets/img/add-task/subtask-check.svg" class="d-none" onclick="editEditSubtaskFromList(${subtask.id})" alt="Edit Subtask">
                        <img src="../assets/img/add-task/clear.svg" class="d-none" onclick="deleteSubtask(${subtask.id})" alt="Clear Subtask">
                    </div>
                </li>
            </ul>  
        </div>
    `;
}

// Function to handle editing a specific subtask
function editEditSubtaskFromList(id) {
    let subtask = editSubtaskArray.find(task => task.id === id);  // Get the specific subtask
    if (subtask) {
        let editSubtaskListItemsRef = document.getElementById(`editSubtaskListItems-${id}`);
        
        // Add the border-bottom style to the specific subtask
        editSubtaskListItemsRef.classList.add('border-bottom-turquoise');
        
        // Replace with editable template
        editSubtaskListItemsRef.innerHTML = editEditSubtaskFromListTemplate(subtask);  
    }
}

// Render the editable version of the subtask (input field)
function editEditSubtaskFromListTemplate(subtask) {
    return /*html*/ `
        <div class="edit-subtask-list-items" id="editSubtaskListItems-${subtask.id}">
            <ul>
                <li class="edit-subtask-list-items-single">
                    <input type="text" value="${subtask.title}" id="editSubtaskInput-${subtask.id}">
                    <div class="edit-subtask-list-items-single-imgs">
                        <img src="../assets/img/add-task/subtask-check.svg" onclick="saveSubtaskEdit(${subtask.id})" alt="Save Subtask">
                        <div class="seperator-imgs"></div>
                        <img src="../assets/img/add-task/clear.svg" onclick="cancelEdit(${subtask.id})" alt="Cancel Edit">
                    </div>
            
                </li>
            </ul>  
        </div>
    `;
}

// Save the edit of a subtask
function saveSubtaskEdit(id) {
    let editedValue = document.getElementById(`editSubtaskInput-${id}`).value;
    let subtask = editSubtaskArray.find(task => task.id === id);
    
    if (subtask) {
        subtask.title = editedValue;  // Update the title with the edited value
        editRenderSubtaskInputEntrys();  // Re-render the list
    }
}

// Cancel editing the subtask
function cancelEdit(id) {
    editSubtaskArray = editSubtaskArray.filter(task => task.id !== id); 
    editRenderSubtaskInputEntrys();  // Re-render the list without saving changes
}

// Delete the subtask
function deleteSubtask(id) {
    editSubtaskArray = editSubtaskArray.filter(task => task.id !== id);  // Remove the subtask from the array
    editRenderSubtaskInputEntrys();  // Re-render the list
}

function editSubtasksFromDatabase(taskSubtasksFromTask) {
    // Reset and copy subtasks from the task
    editSubtaskArray = [...taskSubtasksFromTask];

    // Append subtasks to the array if not already in editSubtasksArray
    subtasksArray.forEach(subtask => {
        if (!editSubtaskArray.some(existingSubtask => existingSubtask.id === subtask.id)) {
            editSubtaskArray.push(subtask);
        }
    });

    editAddSubtaskInputToArray();
}

function renderFooter(task) {
    let renderFooterRef = document.getElementById('editTaskFooter');
    renderFooterRef.innerHTML = renderFooterTemplate(task);
}

function renderFooterTemplate(task) {
    return /*html*/ `
    <div class="field-required">
        <p>
            <span class="required-star-markers">*</span>
            This field is required
        </p>
    </div>
    <div class="clear-create-buttons-wrapper" id="okButtonWrapper">
        <button class="create-task-button" onclick="saveTaskEdit('${task.id}')">
            <p>Ok</p> 
            <img src="../assets/img/add-task/check.svg" alt="Create">
        </button>
    </div>
    `;
}

function saveTaskEdit(taskID) {
    const newTitle = document.getElementById("edit-title-input").value;
    const newDescription = document.getElementById("edit-description-input").value;
    const newDueDate = document.getElementById("edit-due-date-input").value;
    const newContacts = editAssignedUsersfromCheckboxes;
    const newPrioButton = editSelectedPrioButton;
    const newCategory =  document.getElementById("edit-category-input-placeholder").innerHTML
    const newSubtasks = editSubtaskArray; 

   
    const updatedData = {
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate,
        assignedContacts: newContacts, 
        prioButton: newPrioButton,
        category: newCategory,
        subtasks: newSubtasks,
    };

   
    updateTaskInDatabase(taskID, updatedData);

    document.getElementById("editTaskOverlay").classList.toggle("d-none");

    

}


async function updateTaskInDatabase(taskID, updatedData) {
    
    const taskUrl = `${FIREBASE_URL}/tasks/${taskID}.json`;  

    const response = await fetch(taskUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
        throw new Error('Failed to update task');
    }
}










