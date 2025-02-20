function showEditTaskOverlay(title) {
    document.getElementById("editTaskOverlay").style.display = "flex";

      // Find the task by its title
      const task = loadedTasks.find(t => t.title === title);

      console.log(loadedTasks);
      
      // If the task exists, populate the input field with the task's title
      if (task) {
          document.getElementById("edit-title-input").value = task.title;
          document.getElementById("edit-description-input").value = task.description;
          document.getElementById("edit-category-input-placeholder").value = task.category;
      }
}

function editRenderAssignedToInput() {
    let assignedToList = document.getElementById("edit-assigned-to-list");
    assignedToList.innerHTML = ""; // Clear existing content

    // Check if there are users to display
    if (users.length === 0) {
        // If no users, display a "Users not found" message
        assignedToList.innerHTML = "<p>Users not found</p>";
    } else {
        // Otherwise, render the users
        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            assignedToList.innerHTML += editGenerateUserHTML(user); // Use the template function
        }
    }
}

function editGenerateUserHTML(user) {
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

function editToggleAssignedToList() {
    let toggleAssignedToListRef = document.getElementById('edit-assigned-to-input');
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





