function hideEditTaskOverlay() {
    // Hide the edit task overlay
    document.getElementById("editTaskOverlay").style.display = "none";

}


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

        editAssignSubtasksFromDatabase(task.subtasks);

        editAddSubtaskInputToArray();

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

//subtasks functions

// Array to store the subtasks
let editSubtaskArray = [];

function editAssignSubtasksFromDatabase(taskSubtasksFromTask) {
    // Reset and copy subtasks from the task
    editSubtaskArray = [...taskSubtasksFromTask];

    // Append subtasks to the array if not already in editSubtasksArray
    subtasksArray.forEach(subtask => {
        if (!editSubtasksArray.some(existingSubtask => existingSubtask.id === subtask.id)) {
            editSubtasksArray.push(subtask);
        }
    });
}

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
                    <div>
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
                    <div>
                        <img src="../assets/img/add-task/subtask-check.svg" onclick="saveSubtaskEdit(${subtask.id})" alt="Save Subtask">
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
    editRenderSubtaskInputEntrys();  // Re-render the list without saving changes
}

// Delete the subtask
function deleteSubtask(id) {
    editSubtaskArray = editSubtaskArray.filter(task => task.id !== id);  // Remove the subtask from the array
    editRenderSubtaskInputEntrys();  // Re-render the list
}

// function saveUpdatedTask() {
//     const updatedTask = {
//         id: task.id, // Make sure task.id is set
//         title: document.getElementById("edit-title-input").value,
//         description: document.getElementById("edit-description-input").value,
//         dueDate: document.getElementById("edit-due-date-input").value,
//         prioButton: getPrioButtonValue(), // Assuming you have a function to get this value
//         category: document.getElementById('edit-category-input-placeholder').innerHTML,
//         assignedContacts: editAssignedUsersfromCheckboxes, // Updated assigned users
//         subtasks: editSubtaskArray,  // Updated subtasks
//     };

//     // Now send the updated task to the database
//     editUpdateTaskToDatabase(updatedTask);
// }

// // Function to send the updated task to the Firebase database
// async function editUpdateTaskToDatabase(updatedTask) {
//     try {
//         const taskId = updatedTask.id;  // Get the task ID
//         const updatedTaskData = {
//             title: updatedTask.title,
//             description: updatedTask.description,
//             dueDate: updatedTask.dueDate,
//             prioButton: updatedTask.prioButton,
//             category: updatedTask.category,
//             assignedContacts: updatedTask.assignedContacts,
//             subtasks: updatedTask.subtasks, // Include the updated subtasks array
//         };

//         // Make the PUT request to update the task in the database
//         const response = await fetch(FIREBASE_URL + `/tasks/${taskId}.json`, {
//             method: 'PUT', // PUT for replacing the task
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(updatedTaskData), // Send the updated task data as JSON
//         });

//         if (!response.ok) {
//             throw new Error('Failed to update the task.');
//         }

//         // Optionally, handle the success response
//         console.log('Task updated successfully');

//         // Provide feedback to the user (you can display a success message or a toast)
//         alert('Task has been updated successfully!');
        
//         // Optionally, update the UI or reload the tasks list after the update
//         refreshTaskList();
        
//     } catch (error) {
//         console.error("Error updating task:", error);
//         alert("Error updating task. Please try again later.");
//     }
// }








// function renderEntrySubtask() {
//     let subtaskContainer = document.getElementById('subtask-container');
//     subtaskContainer.innerHTML = generateEntrySubtaskHTML(); // Use the template function

//     // Focus the input field
//     document.getElementById('subtask-input').focus();
// }



// function addSubtaskToArray() {
//     let subtaskInput = document.getElementById("subtask-input").value; 
    
//     if (subtaskInput) { 
//         subtasksArray.push(subtaskInput); 
//         document.getElementById("subtask-input").value = ""; 
//         renderSubtasks(); 
//     }
// }

// function removeSubtask(index) {
//     subtasksArray.splice(index, 1);
//     renderSubtasks();
// }

// function renderSubtasks() {
//     let subtasksList = document.getElementById("subtasks-list");
//     subtasksList.innerHTML = ""; // Clear previous subtasks

//     subtasksArray.forEach((subtask, index) => {
//         subtasksList.innerHTML += generateSubtaskHTML(subtask, index); // Use the template function
//     });

//     // Ensure the subtasks list is visible
//     subtasksList.classList.remove('d-none');
// }


// function renderSubtasksEdit() {
//     let subtasksList = document.getElementById("subtasks-list");
//     subtasksList.innerHTML = ""; // Clear previous subtasks

//     subtasksArray.forEach((subtask, index) => {
//         subtasksList.innerHTML += generateSubtaskEditHTML(subtask, index); // Use the template function
//     });
// }


// function updateSubtask(index) {
//     let editedInputValueSubtaskRef = document.getElementById(`edited-input-value-subtask-${index}`);
    
//     if (editedInputValueSubtaskRef) {
//         subtasksArray[index] = editedInputValueSubtaskRef.value; // Update the subtasksArray with the new value
//         renderSubtasks(); // Re-render the subtasks list
//     }
// }

// // clears subtasksArray

// function emptySubtaskArrayFull() {

//     subtasksArray.splice(0, subtasksArray.length);
//     renderSubtasks();

//     let subtaskList = document.getElementById('subtasks-list')
//     subtaskList.classList.add('d-none');

// }

// function generateEntrySubtaskHTML() {
//     return /*html*/ `
//         <div id="subtask-container-js">
//             <input type="text" id="subtask-input" name="subtask" placeholder="Subtask">
//             <div id="subtask-container-js-images">
//                 <img src="../assets/img/add-task/clear.svg" onclick="emptySubtaskArrayFull()" alt="Clear Subtask">
//                 <div class="subtask-container-js-images-devider"></div>
//                 <img src="../assets/img/add-task/subtask-check.svg" onclick="addSubtaskToArray()" alt="Add Subtask">  
//             </div>
//         </div>
//     `;
// }

// /**
//  * Generates an HTML representation of a subtask.
//  */
// function generateSubtaskHTML(subtask, index) {
//     return /*html*/ `
//         <li class="subtask-list-items">${subtask} 
//             <div class="subtask-list-items-img-wrapper">
//                 <img src="../assets/img/add-task/pen.svg" onclick="renderSubtasksEdit(${index})" alt="Edit Subtask">
//                 <div class="subtask-container-js-images-devider"></div>
//                 <img src="../assets/img/add-task/subtask-bin.svg" onclick="removeSubtask(${index})" alt="Remove Subtask">
//             </div>
//         </li>
//     `;
// }

// /**
//  * Generates an HTML input field for editing a subtask.
//  */
// function generateSubtaskEditHTML(subtask, index) {
//     return /*html*/ `
//         <li class="subtask-list-items">
//             <input id="edited-input-value-subtask-${index}" type="text" value="${subtask}">
//             <div class="edit-images-subtasks-wrapper">
//                 <img src="../assets/img/add-task/subtask-bin.svg" onclick="removeSubtask(${index})" alt="Delete">
//                 <div class="subtask-container-js-images-devider"></div>
//                 <img src="../assets/img/add-task/subtask-check.svg" onclick="updateSubtask(${index})" alt="Save">
//             </div>
//         </li>
//     `;
// }




// // Function to transform subtasks array to include title and boolean
// function transformSubtasks(subtasksArray) {
//     return subtasksArray.map(subtask => {
//         return {
//             title: subtask,   // Each subtask is now the 'title'
//             boolean: false    // Defaulting the 'boolean' to false
//         };
//     });
// }








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





