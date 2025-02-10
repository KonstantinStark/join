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

function createTaskCardHTML(task) {
    const categoryClass = setBackgroundColorByCategory(task.category);
    const progressData = calculateSubtaskProgress(task.subtasks);
    
    // Create the SVG for each assigned user using the `generateUserAvatar` function
    const userAvatars = task.assignedContacts.map(user => generateUserAvatar(user)).join("");  // Join the SVGs into one string

    return `
        <div id="task-${task.id}" class="single-task-card" draggable="true" 
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

            <p>${task.prioButton || "Not Set"}</p>

            <!-- Render assigned user avatars (SVGs) -->
            <div class="assigned-users">
                ${userAvatars || "None"}
            </div>
        </div>`;
}




// Render function for "To Do" tasks
function renderToDoTasks(tasks) {
    const taskContainer = document.getElementById("to-do-cards");
    taskContainer.innerHTML = ""; 
    let toDoTasks = tasks.filter(task => task.boardCategory === "to-do");

    toDoTasks.forEach(task => {
        taskContainer.innerHTML += createTaskCardHTML(task);
    });
}

// Render function for "In Progress" tasks
function renderInProgressTasks(tasks) {
    const taskContainer = document.getElementById("in-progress-cards");
    taskContainer.innerHTML = ""; 
    let inProgressTasks = tasks.filter(task => task.boardCategory === "in-progress");

    inProgressTasks.forEach(task => {
        taskContainer.innerHTML += createTaskCardHTML(task);
    });
}

// Render function for "Await Feedback" tasks
function renderAwaitFeedbackTasks(tasks) {
    const taskContainer = document.getElementById("await-feedback-cards");
    taskContainer.innerHTML = ""; 
    let awaitFeedbackTasks = tasks.filter(task => task.boardCategory === "await-feedback");

    awaitFeedbackTasks.forEach(task => {
        taskContainer.innerHTML += createTaskCardHTML(task);
    });
}

// Render function for "Done" tasks
function renderDoneTasks(tasks) {
    const taskContainer = document.getElementById("done-cards");
    taskContainer.innerHTML = ""; 
    let doneTasks = tasks.filter(task => task.boardCategory === "done");

    doneTasks.forEach(task => {
        taskContainer.innerHTML += createTaskCardHTML(task);
    });
}


// Call loadTasks() when the page loads
window.onload = loadTasks;
