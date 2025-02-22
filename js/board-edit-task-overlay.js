let editAssignedUsersfromCheckboxes = [];

function showEditTaskOverlay(title) {
    document.getElementById("editTaskOverlay").style.display = "flex";

    // Find the task by its title
    const task = loadedTasks.find(t => t.title === title);

    console.log(loadedTasks);

    // If the task exists, populate the input field with the task's title
    if (task) {
        document.getElementById("edit-title-input").value = task.title;
        document.getElementById("edit-description-input").value = task.description;
        document.getElementById("edit-due-date-input").value = task.dueDate;
        editSetPrioButton(task.prioButton);
        document.getElementById('edit-category-input-placeholder').innerHTML = task.category;

        // Call the new function to handle users and checkboxes
        editRenderAssignedToFromDatabase(task.assignedContacts);
    }
}


// This function handles both appending users to the array and marking the checkboxes as checked
function editRenderAssignedToFromDatabase(assignedContactsFromTask) {
    // Reset and copy users from the task
    editAssignedUsersfromCheckboxes = [...assignedContactsFromTask];

    // Append assignedContacts to the array if not already in editAssignedUsersfromCheckboxes
    assignedContacts.forEach(contact => {
        if (!editAssignedUsersfromCheckboxes.some(user => user.id === contact.id)) {
            editAssignedUsersfromCheckboxes.push(contact);
        }
    });

    // Now that you have the assigned users, mark their checkboxes as checked
    editAssignedUsersfromCheckboxes.forEach(user => {
        // Find the checkbox corresponding to each user
        let checkBox = document.getElementById(`checkbox-${user.id}`);
        if (checkBox) {
            checkBox.checked = true; // Set the checkbox to checked
        }
    });
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
            <div class="assigned-to-list-values">
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
            </div>
            <!-- Wrap user.id in quotes to pass it as a string -->
            <input 
                type="checkbox" 
                id="checkbox-${user.id}" 
                class="assigned-to-checkboxes" 
                value="${user.id}" 
                onchange="editCheckedAssignedUsers('${user.id}')"> <!-- Pass user.id as a string -->
        </label>
    `;
}

// The main function that handles checkbox change
function editCheckedAssignedUsers(userId) {
    let checkBox = document.getElementById(`checkbox-${userId}`);

    // Check if the checkbox is checked
    if (checkBox.checked == true) {
        // Add the user to the array if the checkbox is checked
        addUserToAssignedArray(userId);
    } else {
        // If the checkbox is unchecked, remove the user from the array
        removeUserFromAssignedArray(userId);
    }

    // Re-render the SVG list
    editRenderUserSvg();
}

// Function to add the user to the assigned users array
function addUserToAssignedArray(userId) {
    let checkedUser = users.find(user => user.id === userId);

    if (checkedUser && !editAssignedUsersfromCheckboxes.includes(checkedUser)) {
        // Push the selected user into the array if not already there
        editAssignedUsersfromCheckboxes.push(checkedUser);
    }
}

// Function to remove the user from the assigned users array
function removeUserFromAssignedArray(userId) {
    let checkedUserIndex = editAssignedUsersfromCheckboxes.findIndex(user => user.id === userId);

    if (checkedUserIndex !== -1) {
        // Remove the user from the array if found
        editAssignedUsersfromCheckboxes.splice(checkedUserIndex, 1);
    }
}

function editRenderUserSvg() {
    let editRenderUserSvgRef = document.getElementById('edit-assigned-to-input-svg-below');
    editRenderUserSvgRef.innerHTML = "";  // Clear previous SVGs

    // Iterate over the editAssignedUsersfromCheckboxes array and generate SVG for each user
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





// function getSelectedAssignedUsers() {
//     assignedContacts = []; // Reset the assigned contacts array each time
//     const checkboxes = document.querySelectorAll('.assign-checkbox');

//     checkboxes.forEach(checkbox => {
//         let assignedToValue = checkbox.closest('.assigned-to-list-values');
        
//         if (checkbox.checked) {
//             // Find the user object based on the checkbox value (ID)
//             const selectedUser = users.find(user => user.id === checkbox.value);
            
//             if (selectedUser) {
//                 assignedContacts.push(selectedUser); // Push the full user object into the array
//             }

//             assignedToValue.classList.add('bg-color-black'); // Add background color for checked checkboxes
//         } else {
//             assignedToValue.classList.remove('bg-color-black'); // Remove background color for unchecked checkboxes
//         }
//     });

//     return assignedContacts;
// }

function editToggleAssignedToList() {
    let toggleAssignedToListRef = document.getElementById('edit-assigned-to-input');
    toggleAssignedToListRef.classList.toggle('d-block');

    // Only render the assigned inputs below if the list is hidden
    if (!toggleAssignedToListRef.classList.contains('d-block')) {
        editRenderAssignedToInputCheckedBelow() 
    } else {
        // Clear SVGs if the list is open
        document.getElementById('edit-assigned-to-input-svg-below').innerHTML = "";
    }

    // Add an event listener to close the list when clicking outside of it
    document.addEventListener('click', handleClickOutside);
}

function editRenderAssignedToInputCheckedBelow() {
    let renderAssignedToInputCheckedBelowRef = document.getElementById('edit-assigned-to-input-svg-below');
    renderAssignedToInputCheckedBelowRef.innerHTML = "";  // Clear previous SVGs

    // Iterate over the assignedContacts array and generate SVG for each user
    assignedContacts.forEach(assignedContact => {
        if (assignedContact) {
            renderAssignedToInputCheckedBelowRef.innerHTML += generateUserSVG(assignedContact);
        }
    });
}

// function prioButtonOnLoad() {

//     document.getElementById('medium-button').classList.add('active', 'medium');
// }

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

// toggles arrow icon when container is clicked

function toggleRotate() {
    let img = document.getElementById('category-icon');
    img.classList.toggle('rotate');
}










function hideEditTaskOverlay() {
    // Hide the edit task overlay
    document.getElementById("editTaskOverlay").style.display = "none";
    
  
}

// function showEditTaskOverlay(taskId) {
//     const task = loadedTasks.find(t => t.id === taskId);

//     if (!task) {
//         console.error("Task not found!");
//         return;
//     }

//     // First, update the subtasksArray
//     pushUpdatedSubtasksToArray(taskId);

//     // Get the overlay element
//     let overlay = document.getElementById("editTaskOverlay");

//     // Hide the task overlay
//     document.getElementById("task-overlay").classList.add('d-none');

//     // Show the edit task overlay
//     overlay.classList.remove('d-none');

//     // Populate the overlay with task data
 
       
//     // Now call the function to highlight the priority button
//     activateButtonFromDatabase(taskId);
// }


// function pushUpdatedSubtasksToArray(taskId) {
//     const task = loadedTasks.find(t => t.id === taskId);
    
//     if (task) {
//         // Check if task.subtasks is defined and is an array
//         if (Array.isArray(task.subtasks)) {
//             // Create an array of updated subtasks with taskId reference
//             const updatedSubtasks = task.subtasks.map(subtask => ({
//                 taskId: task.id,  // Reference to the parent task ID
//                 title: subtask.title,
//                 boolean: subtask.boolean,
//             }));

//             // Remove any previous subtasks for this task from subtasksArray
//             subtasksArray = subtasksArray.filter(subtask => subtask.taskId !== taskId);

//             // Push updated subtasks into the subtasksArray
//             subtasksArray.push(...updatedSubtasks);

//             console.log("Updated subtasks array:", subtasksArray);  // For debugging
//         } else {
//             console.warn(`Subtasks for task with ID ${taskId} are not properly defined.`);
//         }
//     }
// }

// function generateSubtaskHTMLEdit (subtask, index) {
//     return /*html*/ `
//         <li class="subtask-list-items">
//             ${subtask.title} 
//             <div class="subtask-list-items-img-wrapper">
//                 <img src="../assets/img/add-task/pen.svg" onclick="renderSubtasksEdit(${index})" alt="Edit Subtask">
//                 <div class="subtask-container-js-images-devider"></div>
//                 <img src="../assets/img/add-task/subtask-bin.svg" onclick="removeSubtask(${index})" alt="Remove Subtask">
//             </div>
//         </li>
//     `;
// }

// function activateButtonFromDatabase(taskId) {
//     // Find the task from loadedTasks using taskId
//     const task = loadedTasks.find(t => t.id === taskId);

//     if (task) {
//         // Get the priority button value from the task (low, medium, urgent)
//         const prio = task.prioButton;

//         // Check if the prio value is valid
//         if (['low', 'medium', 'urgent'].includes(prio)) {
//             // Reset all buttons by removing the 'active' class
//             const prioButtons = document.querySelectorAll('.prio-buttons button');
//             prioButtons.forEach(button => {
//                 button.classList.remove('active'); // Remove active class from all buttons
//             });

//             // Add the 'active' class to the button corresponding to the priority
//             const activeButton = document.getElementById(`${prio}-button`);
//             if (activeButton) {
//                 activeButton.classList.add('active'); // Add 'active' class to the correct button
//             } else {
//                 console.warn(`No button found for priority: ${prio}`);
//             }
//         } else {
//             console.warn(`Invalid prioButton value: ${prio}`);
//         }
//     } else {
//         console.error(`Task with ID ${taskId} not found`);
//     }
// }





