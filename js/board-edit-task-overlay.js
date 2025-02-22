let editAssignedUsersfromCheckboxes = [];

function showEditTaskOverlay(title) {
    // Reset the array and uncheck all checkboxes
    resetAssignedUsers();

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
        editAssignUsersFromDatabase(task.assignedContacts);
        // Now mark the checkboxes as checked based on the assigned users
        editMarkCheckboxesAsChecked();
    }
}

// Function to reset the assigned users and uncheck all checkboxes
function resetAssignedUsers() {
    // Clear the array
    editAssignedUsersfromCheckboxes = [];

    // Uncheck all checkboxes by their ID
    assignedContacts.forEach(contact => {
        let checkBox = document.getElementById(`checkbox-${contact.id}`);
        if (checkBox) {
            checkBox.checked = false; // Uncheck the checkbox
        }
    });
}

// Function to handle adding users to the editAssignedUsersfromCheckboxes array and avoiding duplicates
function editAssignUsersFromDatabase(assignedContactsFromTask) {
    // Reset and copy users from the task
    editAssignedUsersfromCheckboxes = [...assignedContactsFromTask];

    // Append assignedContacts to the array if not already in editAssignedUsersfromCheckboxes
    assignedContacts.forEach(contact => {
        if (!editAssignedUsersfromCheckboxes.some(user => user.id === contact.id)) {
            editAssignedUsersfromCheckboxes.push(contact);
        }
    });
}

// needs function to reset background color from start 


// Function to mark checkboxes as checked for assigned users and change background color
function editMarkCheckboxesAsChecked() {
    // First, clear background color from all items
    

    // Now, loop through the users and set their checkboxes and background color
    editAssignedUsersfromCheckboxes.forEach(user => {
        // Use getElementById to find the checkbox by user.id
        let checkBox = document.getElementById(`checkbox-${user.id}`);
        
        if (checkBox) {
            checkBox.checked = true; // Set the checkbox to checked
        }

        // Change the background color of the assigned list item for checked users
        editChangeBackgroundColor(user.id, true);
    });

    // Call the function to render the SVG
    editRenderUserSvg();
}


function resetAssignedUsers() {
    // Clear the array
    editAssignedUsersfromCheckboxes = [];

    // Uncheck all checkboxes
    let checkboxes = document.querySelectorAll('.assigned-to-checkboxes');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Function to handle adding users to the editAssignedUsersfromCheckboxes array and avoiding duplicates
function editAssignUsersFromDatabase(assignedContactsFromTask) {
    // Reset and copy users from the task
    editAssignedUsersfromCheckboxes = [...assignedContactsFromTask];

    // Append assignedContacts to the array if not already in editAssignedUsersfromCheckboxes
    assignedContacts.forEach(contact => {
        if (!editAssignedUsersfromCheckboxes.some(user => user.id === contact.id)) {
            editAssignedUsersfromCheckboxes.push(contact);
        }
    });
}

// Function to mark checkboxes as checked for assigned users and change background color

function editMarkCheckboxesAsChecked() {
    editAssignedUsersfromCheckboxes.forEach(user => {
        // Use getElementById to find the checkbox by user.id
        let checkBox = document.getElementById(`checkbox-${user.id}`);

        if (checkBox) {
            checkBox.checked = true; // Set the checkbox to checked
        }

        // Change the background color of the assigned list item
        editChangeBackgroundColor(user.id, true);
    });

    // Call the function to render the SVG
    editRenderUserSvg();
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
// The main function that handles checkbox change
function editCheckedAssignedUsers(userId) {
    let checkBox = document.getElementById(`checkbox-${userId}`);

    // Check if the checkbox is checked
    if (checkBox.checked == true) {
        // Add the user to the array if the checkbox is checked
        addUserToAssignedArray(userId);

        // Change the background color of the container to black
        editChangeBackgroundColor(userId, true);
    } else {
        // If the checkbox is unchecked, remove the user from the array
        removeUserFromAssignedArray(userId);

        // Reset the background color (or change to a different color if desired)
        editChangeBackgroundColor(userId, false);
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
    let editRenderUserSvgRef = document.getElementById('edit-render-assigned-svg');
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





