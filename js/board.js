const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";
let loadedTasks = [];
let users = [];

async function loadTasks() {
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

        // Save tasks globally for later use in drop functions
        loadedTasks = tasks;

        renderToDoTasks(tasks);
        renderInProgressTasks(tasks);
        renderAwaitFeedbackTasks(tasks);
        renderDoneTasks(tasks);
    } catch (error) {
        console.error("Can't fetch tasks:", error);
    }
}

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

function generateUserName(user) {
    // Assuming the 'user' object has a 'name' property
    return user.name ? `<p class="user-name">${user.name}</p>` : "<p class='user-name'>No Name</p>";
}


function getPrioSVG(prio) {
    // Check the prio string and return the appropriate SVG markup
    switch (prio) {
        case 'urgent':
            return `<img src="../assets/img/add-task/urgent.svg" alt="Urgent">`;
        case 'medium':
            return `<img src="../assets/img/add-task/medium.svg" alt="Medium">`;
        case 'low':
            return `<img src="../assets/img/add-task/low.svg" alt="Low">`;
        default:
            return `<span>Not Set</span>`; // Fallback when prio is not set or invalid
    }
}


function createTaskCardHTML(task) {
    const categoryClass = setBackgroundColorByCategory(task.category);
    const progressData = calculateSubtaskProgress(task.subtasks);

    // Create the SVG for each assigned user using the `generateUserAvatar` function
    const userAvatars = task.assignedContacts.map(user => generateUserAvatar(user)).join("");  // Join the SVGs into one string

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
                    ${userAvatars || "None"}
                </div>

                <div class="prio-button-board">
                    <p>${task.prioButton ? getPrioSVG(task.prioButton) : "Not Set"}</p>
                </div>
            </div>
        </div>`;
}



function taskCardsOverlay(taskId) {
    // Find the task from the global tasks array (or the array you are working with)
    const task = loadedTasks.find(t => t.id === taskId);

    if (!task) {
        console.error('Task not found with ID:', taskId);
        return;
    }

    // Get the overlay element by its ID
    const overlay = document.getElementById("task-overlay");

    // Get the container inside the overlay where we'll show the task details
    const overlayDetails = document.getElementById("overlay-task-details");

    // Dynamically build the HTML for the task details
    const categoryClass = setBackgroundColorByCategory(task.category);
    const progressData = calculateSubtaskProgress(task.subtasks);
    
    // Generate the user avatars and user names
    const userAvatars = task.assignedContacts.map(user => generateUserAvatar(user)).join("");
    const userNames = task.assignedContacts.map(user => generateUserName(user)).join("");

    const subtasksCheckboxes = task.subtasks.map((subtask, index) => `
    <div class="subtask-checkbox">
        <input type="checkbox" id="subtask-${index}" ${subtask.completed ? "checked" : ""}>
        <label for="subtask-${index}">${subtask}</label>
    </div>
`).join(""); // Join all subtasks as individual checkboxes

    // Create the HTML for the task overlay
    const taskDetailsHTML = `
        <div class="task-category ${categoryClass}">${task.category}</div>
        <h3>${task.title}</h3>
        <p>${task.description}</p>

        ${progressData ? `
            <div class="subtask-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressData.progressPercentage}%;"></div>
                </div>
                <span>${progressData.completedSubtasks}/${progressData.totalSubtasks} Subtasks</span>
            </div>` : ""}

        <div class="assigned-users-overlay">
            <p>Assigned to:</p>
            ${userAvatars || "No User Avatars"}
            ${userNames || "No User Names"}
        </div>

        <div class="subtasks-list">
            <p>Subtasks:</p>
            ${subtasksCheckboxes || "No Subtasks"}
        </div>

        <div class="prio-button-board">
            <p>${task.prioButton ? getPrioSVG(task.prioButton) : "Not Set"}</p>
        </div>
    `;

    // Insert the task details into the overlay container
    overlayDetails.innerHTML = taskDetailsHTML;

    // Show the overlay by removing the 'd-none' class
    overlay.classList.remove("d-none");
}


function closeOverlay() {

    document.getElementById("task-overlay").classList.add("d-none");
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


// Call loadTasks() when the page loads
window.onload = loadTasks;
