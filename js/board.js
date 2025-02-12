const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";

let loadedTasks = [];

// Load all tasks by default when the page loads
loadTasks();

// Main function to load tasks with optional search capability
async function loadTasks(query = '') {
    try {
        const tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
        const responseToJson = await tasksResponse.json();
        const tasks = [];

        if (responseToJson) {
            const keys = Object.keys(responseToJson);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                tasks.push({ id: key, ...responseToJson[key] });
            }
        }

        // If there is a search query, filter tasks; otherwise, return all tasks
        const filteredTasks = query ? searchTasks(tasks, query) : tasks;

        // Save tasks globally for later use in drop functions
        loadedTasks = filteredTasks;

        // Render the filtered or all tasks
        renderToDoTasks(filteredTasks);
        renderInProgressTasks(filteredTasks);
        renderAwaitFeedbackTasks(filteredTasks);
        renderDoneTasks(filteredTasks);

    } catch (error) {
        console.error("Can't fetch tasks:", error);
    }
}

// drag and drop functionality

function startDragging(event, taskId) {
    event.dataTransfer.setData('taskId', taskId); // Store the dragged task ID
    // Add the dragging class to tilt the container
    event.target.classList.add('dragging');
}

// Drag end function to remove the tilt effect
function endDragging(event) {
    // Remove the dragging class to stop the tilt effect
    event.target.classList.remove('dragging');
}

// Allow task container to accept drops
function allowDrop(event) {
    event.preventDefault();
}

// Handle drop event
async function handleDrop(event, newCategory) {
    event.preventDefault();

    const taskId = event.dataTransfer.getData('taskId'); // Get task ID from drag event
    const task = loadedTasks.find(t => t.id === taskId); // Find task by ID

    if (task) {
        task.boardCategory = newCategory; // Update the task's category
        await updateTaskInDatabase(task); // Update the task in Firebase
        renderAllTasks(); // Re-render all tasks with updated categories
    }
}
// Update task in Firebase
async function updateTaskInDatabase(updatedTask) {
    try {
        await fetch(FIREBASE_URL + `/tasks/${updatedTask.id}.json`, {
            method: 'PATCH',
            body: JSON.stringify(updatedTask),
        });
    } catch (error) {
        console.error("Error updating task in database:", error);
    }
}

// Re-render all tasks after an update
function renderAllTasks() {
    renderToDoTasks(loadedTasks);
    renderInProgressTasks(loadedTasks);
    renderAwaitFeedbackTasks(loadedTasks);
    renderDoneTasks(loadedTasks);
}


// render functionality for the different taskcards

function setBackgroundColorByCategory(category) {
    if (category === "Technical Task") {
        return "technical-task"; // Class for Technical Task
    } else if (category === "User Story") {
        return "user-story"; // Class for User Story
    }
    return ""; // Default, no class if category doesn't match
}

function calculateSubtaskProgress(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return null; // No subtasks, return null
    }

    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(st => st.completed).length;
    const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

    return { totalSubtasks, completedSubtasks, progressPercentage };
}

function generateSubtaskCheckboxes(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return "";  // Return a message when no subtasks exist
    }

    return subtasks.map((subtask, index) => `
        <div class="subtask-checkbox">
            <input type="checkbox" id="subtask-${index}" ${subtask.completed ? "checked" : ""}>
            <label for="subtask-${index}">${subtask.title || subtask}</label> <!-- Assuming subtask has a title property -->
        </div>
    `).join(""); // Join all subtasks as individual checkboxes
}

//user avatars and initials

function generateUserAvatar(user) {
    return `
        
        <svg width="40" height="40">
            <circle cx="20" cy="20" r="16" fill="${user.color}" />
            <text x="20" y="22" text-anchor="middle" fill="white" font-size="14" font-family="Arial" dy=".35em">
                ${user.initials}
            </text>
        </svg>  
    `;
}

//checks if assignedContacts is an array

function generateUserAvatars(assignedContacts) {
    // Ensure assignedContacts is an array before calling map, and handle empty or undefined
    if (Array.isArray(assignedContacts) && assignedContacts.length > 0) {
        return assignedContacts.map(user => generateUserAvatar(user)).join("");  // Join the SVGs into one string
    }
    return "";  // Return "None" if no users are assigned
}

function generateUserName(user) {
    // Assuming the 'user' object has a 'name' property
    return user.name ? `<p class="user-name">${user.name}</p>` : "<p class='user-name'>No Name</p>";
}


// prio buttons

function getPrioSVG(prio) {
    // Check the prio string and return the appropriate SVG markup
    switch (prio) {
        case 'urgent':
            return `<img src="../assets/img/add-task/urgent.svg" alt="Urgent">`;
        case 'medium':
            return `<img src="../assets/img/add-task/medium.svg" alt="Medium">`;
        case 'low':
            return `<img src="../assets/img/add-task/low.svg" alt="Low">`;
        }

}

function createTaskCardHTML(task) {
    const categoryClass = setBackgroundColorByCategory(task.category);
    const progressData = calculateSubtaskProgress(task.subtasks);
    
    // Outsource the generation of user avatars and handle empty/undefined lists
    const userAvatars = generateUserAvatars(task.assignedContacts);
    
    // Now, use the template function to create the task card HTML
    return generateTaskCardTemplate(task, categoryClass, userAvatars, progressData);
}

function generateTaskCardTemplate(task, categoryClass, userAvatars, progressData) {
    return `
        <div id="task-${task.id}" class="single-task-card" draggable="true" onclick="taskCardsOverlay('${task.id}')"
            ondragstart="startDragging(event, '${task.id}')" ondrop="handleDrop(event, '${task.boardCategory}')" ondragover="allowDrop(event)">
            
            <p class="task-category ${categoryClass}">${task.category}</p>
            <h3>${task.title}</h3>
            <p>${task.description}</p>

            ${progressData ? `
                <div class="subtask-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressData.progressPercentage}%;"></div>
                    </div>
                    <span>${progressData.completedSubtasks}/${progressData.totalSubtasks} Subtasks</span>
                </div>` : ""}

            <!-- Render assigned user avatars (SVGs) -->
            <div class="assigned-users-prio-button-wrapper">
                <div class="assigned-users">
                    ${userAvatars || ""}
                </div>

                <div class="prio-button-board">
                    <p>${task.prioButton ? getPrioSVG(task.prioButton) : getPrioSVG('medium')}</p>
                </div>

            </div>
        </div>`;
}


function generateTaskOverlayTemplate(task, categoryClass, userAvatars, subtasksCheckboxes) {
    return `
    <div class="task-category ${categoryClass}">${task.category}</div>
    <h3>${task.title}</h3>
    <p>${task.description}</p>

    <div class="assigned-users-overlay">
        <p>Assigned to:</p>
        ${userAvatars || ""}
    </div>

    <div class="subtasks-list">
        <p>Subtasks:</p>
        ${subtasksCheckboxes || "No Subtasks"}
    </div>

      <div class="prio-button-board">
        <p>${task.prioButton ? getPrioSVG(task.prioButton) : getPrioSVG('medium')}</p>
      </div>

    <!-- Edit and Delete Buttons -->
    <div class="task-action-buttons">
        <img class="delete-button" src="../assets/img/Property 1=Default.png" alt="Delete" onclick="deleteTaskBtn('${task.id}')">
        <span class="divider"></span>
        <img class="edit-button" src="../assets/img/Property 1=Edit2.png" alt="Edit" onclick="editTask(${task.id})">
    </div>
    `;
}

function taskCardsOverlay(taskId) {

    const task = loadedTasks.find(t => t.id === taskId);
    const overlay = document.getElementById("task-overlay");
    const overlayDetails = document.getElementById("overlay-task-details");

    const categoryClass = setBackgroundColorByCategory(task.category);
    const userAvatars = generateUserAvatars(task.assignedContacts);

    const subtasksCheckboxes = generateSubtaskCheckboxes(task.subtasks);
    const taskDetailsHTML = generateTaskOverlayTemplate(task, categoryClass, userAvatars, subtasksCheckboxes);

    overlayDetails.innerHTML = taskDetailsHTML;

    // Show the overlay by removing the 'd-none' class
    overlay.classList.remove("d-none");
}


function closeOverlay() {

    document.getElementById("task-overlay").classList.add("d-none");
}

async function deleteTaskBtn(taskId, tasks) {
    try {
        // Send a DELETE request to Firebase to remove the task
        let response = await fetch(`${FIREBASE_URL}/tasks/${taskId}.json`, { method: "DELETE" });

        if (response.ok) {
            // Remove the task from the local loadedTasks array
            const taskIndex = loadedTasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                loadedTasks.splice(taskIndex, 1);
            }

            // Remove the task card from the UI (assuming it has an ID with taskId)
            const taskCard = document.getElementById(`task-card-${taskId}`);
            if (taskCard) {
                taskCard.remove();
            } else {
                console.error(`Task card with ID 'task-card-${taskId}' not found.`);
            }

            // Optionally close the task overlay if it's open
            const overlay = document.getElementById("task-overlay");
            if (overlay) {
                overlay.classList.add("d-none");
            }

            // Log success
            console.log(`Task with ID: ${taskId} has been deleted from the database and UI.`);

            // Reload the data (or re-render tasks)
            renderToDoTasks(loadedTasks);  // Pass the updated loadedTasks array
            renderInProgressTasks(loadedTasks);
            renderAwaitFeedbackTasks(loadedTasks);
            renderDoneTasks(loadedTasks);
        } else {
            console.error('Failed to delete task:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}



// Render function for "To Do" tasks
function renderToDoTasks(tasks) {
    const taskContainer = document.getElementById("to-do-cards");
    taskContainer.innerHTML = "";  // Clear the container before adding tasks
    let toDoTasks = tasks.filter(task => task.boardCategory === "to-do");

    if (toDoTasks.length > 0) {
        // If there are "to-do" tasks, create and append task cards
        toDoTasks.forEach(task => {
            taskContainer.innerHTML += createTaskCardHTML(task);
        });
    } else {
        // If no "to-do" tasks, display a message in a container with a grey background
        taskContainer.innerHTML = '<div class="empty-task-slots">No tasks To do</div>';
    }
}


// Render function for "In Progress" tasks
function renderInProgressTasks(tasks) {
    const taskContainer = document.getElementById("in-progress-cards");
    taskContainer.innerHTML = "";
    let inProgressTasks = tasks.filter(task => task.boardCategory === "in-progress");

    if (inProgressTasks.length > 0) {
        // If there are "in-progress" tasks, create and append task cards
        inProgressTasks.forEach(task => {
            taskContainer.innerHTML += createTaskCardHTML(task);
        });
    } else {
        // If no "in-progress" tasks, display a message in a container with a grey background
        taskContainer.innerHTML = '<div class="empty-task-slots"">no tasks In progress</div>';
    }
}

// Render function for "Await Feedback" tasks
function renderAwaitFeedbackTasks(tasks) {
    const taskContainer = document.getElementById("await-feedback-cards");
    taskContainer.innerHTML = "";
    let awaitFeedbackTasks = tasks.filter(task => task.boardCategory === "await-feedback");

    if (awaitFeedbackTasks.length > 0) {
        // If there are "await-feedback" tasks, create and append task cards
        awaitFeedbackTasks.forEach(task => {
            taskContainer.innerHTML += createTaskCardHTML(task);
        });
    } else {
        // If no "await-feedback" tasks, display a message in a container with a grey background
        taskContainer.innerHTML = '<div class="empty-task-slots">no tasks Awaiting feeback</div>';
    }
}

// Render function for "Done" tasks
function renderDoneTasks(tasks) {
    const taskContainer = document.getElementById("done-cards");
    taskContainer.innerHTML = "";
    let doneTasks = tasks.filter(task => task.boardCategory === "done");

    if (doneTasks.length > 0) {
        // If there are "done" tasks, create and append task cards
        doneTasks.forEach(task => {
            taskContainer.innerHTML += createTaskCardHTML(task);
        });
    } else {
        // If no "done" tasks, display a message in a container with a grey background
        taskContainer.innerHTML = '<div class="empty-task-slots">No tasks Done</div>';
    }
}

// Function to toggle the "No tasks found" message based on search results
function toggleNoTasksMessage(filteredTasks) {
    const noTasksMessage = document.getElementById('no-tasks-message');
    const searchInput = document.getElementById('task-search').value; // Get the current value of the input field

    if (searchInput === '') {
        // If the input field is empty, hide the "No tasks found" message
        noTasksMessage.classList.add('d-none');
    } else if (filteredTasks.length === 0) {
        // If no tasks found, remove the "d-none" class to show the message
        noTasksMessage.classList.remove('d-none');
    } else {
        // If tasks are found, add the "d-none" class to hide the message
        noTasksMessage.classList.add('d-none');
    }
}

// Updated searchTasks function
function searchTasks(tasks, query) {
    const searchQuery = query.toLowerCase();
    
    // Filter tasks based on the search query
    const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().startsWith(searchQuery) || 
        task.description.toLowerCase().startsWith(searchQuery)
    );

    // Call the toggle function to show or hide the message
    toggleNoTasksMessage(filteredTasks);

    return filteredTasks;
}

// Listen to changes on the input field and trigger loadTasks with the current query
document.getElementById('task-search').addEventListener('input', function() {
    const query = this.value; // Get the current input value
    loadTasks(query); // Call loadTasks with the search query
});



