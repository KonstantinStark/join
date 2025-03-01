const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";

let loadedTasks = [];

// Load all tasks by default when the page loads
loadTasks();

// Main function to load tasks with optional search capability
async function loadTasks(query = '') {
    try {
        const tasksResponse = await fetchTasks();
        const tasks = parseTasks(tasksResponse);
        const filteredTasks = filterTasks(tasks, query);

        loadedTasks = filteredTasks;
        renderTasks(filteredTasks);
    } catch (error) {
        console.error("Can't fetch tasks:", error);
    }
}

async function fetchTasks() {
    const tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
    return await tasksResponse.json();
}

function parseTasks(responseToJson) {
    const tasks = [];
    if (responseToJson) {
        const keys = Object.keys(responseToJson);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            tasks.push({ id: key, ...responseToJson[key] });
        }
    }
    return tasks;
}

function filterTasks(tasks, query) {
    return query ? searchTasks(tasks, query) : tasks;
}

function renderTasks(filteredTasks) {
    renderToDoTasks(filteredTasks);
    renderInProgressTasks(filteredTasks);
    renderAwaitFeedbackTasks(filteredTasks);
    renderDoneTasks(filteredTasks);
}


// drag and drop functionality

// Start dragging - add a class for tilt effect and store task ID
function startDragging(event, taskId) {
    event.dataTransfer.setData('taskId', taskId); // Store the dragged task ID
    // Add the dragging class to tilt the container
    event.target.classList.add('dragging');
}

// Drag end function to remove the tilt effect
function endDragging(event) {
    // Remove the dragging class to stop the tilt effect
    event.target.classList.remove('dragging');
    
    // Remove 'grey-background' from all columns once the drag ends
    removeHighlight();
}

// Allow task container to accept drops
function allowDrop(event) {
    event.preventDefault();

    // Remove the 'grey-background' class from all columns first
    removeHighlight();

    // Ensure the target is the correct drop container
    if (event.target.classList.contains('drop-target')) {
        event.target.classList.add("grey-background");
    }
}

// Function to remove the grey-background highlight from all columns
function removeHighlight() {
    document.getElementById("done-cards").classList.remove("grey-background");
    document.getElementById("to-do-cards").classList.remove("grey-background");
    document.getElementById("in-progress-cards").classList.remove("grey-background");
    document.getElementById("await-feedback-cards").classList.remove("grey-background");
}

// Handle drop event
async function handleDrop(event, newCategory) {
    event.preventDefault();

    // Get task ID from drag event
    const taskId = event.dataTransfer.getData('taskId');
    const task = loadedTasks.find(t => t.id === taskId); // Find task by ID

    if (task) {
        task.boardCategory = newCategory; // Update the task's category
        await updateTaskAfterDragging(task); // Update the task in Firebase
        renderAllTasks(); // Re-render all tasks with updated categories
    }

    // Clear the highlight after drop
    removeHighlight();
}


// Update task in Firebase
async function updateTaskAfterDragging(updatedTask) {
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

// functions to generate content for taskcards and task card overlays 

// render functionality for the different taskcards

function setBackgroundColorByCategory(category) {
    if (category === "Technical Task") {
        return "technical-task"; // Class for Technical Task
    } else if (category === "User Story") {
        return "user-story"; // Class for User Story
    }
    return ""; // Default, no class if category doesn't match
}

// Calculate subtask progress (based on the new 'boolean' field)
function calculateSubtaskProgress(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return null; // No subtasks, return null
    }

    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(st => st.boolean).length; // Use 'boolean' to check completion
    const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

    return { totalSubtasks, completedSubtasks, progressPercentage };
}

// Function to generate checkboxes for each subtask (with 'boolean' value indicating whether it is checked)
function generateSubtaskCheckboxes(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return "";  // Return a message when no subtasks exist
    }

    return subtasks.map((subtask, index) => generateSubtaskCheckboxTemplate(index, subtask)).join(""); 
}

function toggleSubtaskCompletion(index) {
    const taskId = document.getElementById("task-overlay").getAttribute("data-task-id");
    const task = loadedTasks.find(t => t.id === taskId);

    // Use the index to directly access the subtask in the task's subtasks array
    const subtask = task.subtasks[index];  // Use the index directly here
    if (subtask) {
        subtask.boolean = !subtask.boolean; // Toggle the 'boolean' value
        updateTaskProgress(task); // Update task progress
    }
}

// Update progress bar and related info when a subtask is checked/unchecked
function updateTaskProgress(task) {
    const progressData = calculateSubtaskProgress(task.subtasks);
    const progressBar = document.querySelector(`#task-${task.id} .progress-fill`);

    if (progressData) {
        progressBar.style.width = `${progressData.progressPercentage}%`;
        const subtaskText = document.querySelector(`#task-${task.id} .subtask-progress span`);
        subtaskText.textContent = `${progressData.completedSubtasks}/${progressData.totalSubtasks} Subtasks`;
    }
}
//user avatars and initials

// Function to generate the user avatar
function generateUserAvatar(user) {
    return generateAvatarTemplate(user.color, user.initials);
}

//checks if assignedContacts is an array

function generateUserAvatars(assignedContacts) {
    // Ensure assignedContacts is an array before calling map, and handle empty or undefined
    if (Array.isArray(assignedContacts) && assignedContacts.length > 0) {
        return assignedContacts.map(user => generateUserAvatar(user)).join("");  // Join the SVGs into one string
    }
    return "";  // Return "None" if no users are assigned
}

function generateUserNames(task) {
    // Ensure task has assignedContacts and it's an array before calling map, and handle empty or undefined
    if (task.assignedContacts && Array.isArray(task.assignedContacts) && task.assignedContacts.length > 0) {
        return task.assignedContacts.map(user => {
            return user.name ? `<p class="user-name">${user.name}</p>` : "<p class='user-name'>No Name</p>";
        }).join("");  // Join the resulting name elements into one string
    }
    return "<p class='user-name'>No Assigned Users</p>";  // Fallback if no assigned users
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

// Create task card HTML with updated progress bar
function createTaskCardHTML(task) {
    const categoryClass = setBackgroundColorByCategory(task.category);
    const progressData = calculateSubtaskProgress(task.subtasks);

    // Outsource the generation of user avatars and handle empty/undefined lists
    const userAvatars = generateUserAvatars(task.assignedContacts);

    return generateTaskCardTemplate(task, categoryClass, userAvatars, progressData);
}

// Show task details in the overlay when a task card is clicked
function taskCardsOverlay(taskId) {

    const overlay = document.getElementById("task-overlay");

    const task = loadedTasks.find(t => t.id === taskId);
    const overlayDetails = document.getElementById("overlay-task-details");
    const categoryClass = setBackgroundColorByCategory(task.category);
    const userAvatars = generateUserAvatars(task.assignedContacts);
    const userName = generateUserNames(task);
    const subtasksCheckboxes = generateSubtaskCheckboxes(task.subtasks);
    const taskDetailsHTML = generateTaskOverlayTemplate(task, categoryClass, userAvatars, subtasksCheckboxes, userName);
    

    overlayDetails.innerHTML = taskDetailsHTML;
    // Show the overlay by removing the 'd-none' class
    overlay.classList.remove("d-none");

    // Store the task ID in the overlay for later reference (used for toggling checkboxes)
    overlay.setAttribute("data-task-id", task.id);
}

function closeOverlay() {

    document.getElementById("task-overlay").classList.add("d-none");
}

async function deleteTaskBtn(taskId) {
    try {
        let response = await sendDeleteRequest(taskId);

        if (response.ok) {
            removeTaskFromLocalArray(taskId);
            removeTaskCardFromUI(taskId);
            closeTaskOverlay();
            reloadTasks();
        } else {
            console.error('Failed to delete task:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function sendDeleteRequest(taskId) {
    return fetch(`${FIREBASE_URL}/tasks/${taskId}.json`, { method: "DELETE" });
}

function removeTaskFromLocalArray(taskId) {
    const taskIndex = loadedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        loadedTasks.splice(taskIndex, 1);
    }
}

function removeTaskCardFromUI(taskId) {
    const taskCardElement = document.getElementById(`task-card-${taskId}`);
    taskCardElement && taskCardElement.remove();
}

function closeTaskOverlay() {
    const overlay = document.getElementById("task-overlay");
    if (overlay) {
        overlay.classList.add("d-none");
    }
}

function reloadTasks() {
    renderToDoTasks(loadedTasks);
    renderInProgressTasks(loadedTasks);
    renderAwaitFeedbackTasks(loadedTasks);
    renderDoneTasks(loadedTasks);
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
document.getElementById('task-search').addEventListener('input', function () {
    const query = this.value; // Get the current input value
    loadTasks(query); // Call loadTasks with the search query
});

function hideTaskOverlay() {
    let overlay = document.getElementById("taskOverlay");
    overlay.classList.add("d-none");
}








