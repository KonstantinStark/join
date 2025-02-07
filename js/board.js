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

// General drag start function
function startDragging(event, taskId) {
    event.dataTransfer.setData('taskId', taskId); // Store the dragged task ID
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

// Render functions (for each category)
function renderToDoTasks(tasks) {
    const taskContainer = document.getElementById("to-do-cards");
    taskContainer.innerHTML = ""; 
    let toDoTasks = tasks.filter(task => task.boardCategory === "to-do");

    toDoTasks.forEach(task => {
        taskContainer.innerHTML += `
        <div id="task-${task.id}" class="single-task-card" draggable="true" ondragstart="startDragging(event, '${task.id}')" ondrop="handleDrop(event, 'to-do')" ondragover="allowDrop(event)">
            <p>${task.category}</p>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>${task.subtasks ? task.subtasks.join(", ") : "None"}</p>
            <p>${task.prioButton || "Not Set"}</p>
            <p>${task.assignedContacts || "None"}</p>
        </div>`;
    });
}

function renderInProgressTasks(tasks) {
    const taskContainer = document.getElementById("in-progress-cards");
    taskContainer.innerHTML = ""; 
    let inProgressTasks = tasks.filter(task => task.boardCategory === "in-progress");

    inProgressTasks.forEach(task => {
        taskContainer.innerHTML += `
        <div id="task-${task.id}" class="single-task-card" draggable="true" ondragstart="startDragging(event, '${task.id}')" ondrop="handleDrop(event, 'in-progress')" ondragover="allowDrop(event)">
            <p>${task.category}</p>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>${task.subtasks ? task.subtasks.join(", ") : "None"}</p>
            <p>${task.prioButton || "Not Set"}</p>
            <p>${task.assignedContacts || "None"}</p>
        </div>`;
    });
}

function renderAwaitFeedbackTasks(tasks) {
    const taskContainer = document.getElementById("await-feedback-cards");
    taskContainer.innerHTML = ""; 
    let awaitFeedbackTasks = tasks.filter(task => task.boardCategory === "await-feedback");

    awaitFeedbackTasks.forEach(task => {
        taskContainer.innerHTML += `
        <div id="task-${task.id}" class="single-task-card" draggable="true" ondragstart="startDragging(event, '${task.id}')" ondrop="handleDrop(event, 'await-feedback')" ondragover="allowDrop(event)">
            <p>${task.category}</p>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>${task.subtasks ? task.subtasks.join(", ") : "None"}</p>
            <p>${task.prioButton || "Not Set"}</p>
            <p>${task.assignedContacts || "None"}</p>
        </div>`;
    });
}

function renderDoneTasks(tasks) {
    const taskContainer = document.getElementById("done-cards");
    taskContainer.innerHTML = ""; 
    let doneTasks = tasks.filter(task => task.boardCategory === "done");

    doneTasks.forEach(task => {
        taskContainer.innerHTML += `
        <div id="task-${task.id}" class="single-task-card" draggable="true" ondragstart="startDragging(event, '${task.id}')" ondrop="handleDrop(event, 'done')" ondragover="allowDrop(event)">
            <p>${task.category}</p>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>${task.subtasks ? task.subtasks.join(", ") : "None"}</p>
            <p>${task.prioButton || "Not Set"}</p>
            <p>${task.assignedContacts || "None"}</p>
        </div>`;
    });
}

// Call loadTasks() when the page loads
window.onload = loadTasks;
