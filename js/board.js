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
        
        renderToDoTasks(tasks);
        renderInProgressTasks(tasks)
        renderAwaitFeedbackTasks(tasks);
        renderDoneTasks(tasks);
    } catch (error) {
        console.error("cant fetch tasks:", error);
    }
}

function renderToDoTasks(tasks) {
    const taskContainer = document.getElementById("to-do-cards"); // Ensure there's a container with this ID in your HTML
    taskContainer.innerHTML = ""; // Clear existing tasks before rendering new ones

    let toDoTasks = tasks.filter(task => task.boardCategory === "to-do");

    for (let i = 0; i < toDoTasks.length; i++) {
        const task = toDoTasks[i];
        taskContainer.innerHTML += `
        <div class="single-task-card" draggable="true" ondragstart="startDragging(${task.id})">
            <p>${task.category}</p>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>${task.subtasks ? task.subtasks.join(", ") : "None"}</p>
            <p>${task.prioButton || "Not Set"}</p>
            <p>${task.assignedContacts || "None"}</p>
        </div>
        `;
    }
}

function renderInProgressTasks(tasks) {
    const taskContainer = document.getElementById("in-progress-cards"); // Ensure there's a container with this ID in your HTML
    taskContainer.innerHTML = ""; // Clear existing tasks before rendering new ones

    let inProgressTasks = tasks.filter(task => task.boardCategory === "in-progress");

    for (let i = 0; i < inProgressTasks.length; i++) {
        const task = inProgressTasks[i];
        taskContainer.innerHTML += `
        <div class="single-task-card" draggable="true" ondragstart="startDragging(${task.id})">
            <p>${task.category}</p>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>${task.subtasks ? task.subtasks.join(", ") : "None"}</p>
            <p>${task.prioButton || "Not Set"}</p>
            <p>${task.assignedContacts || "None"}</p>
        </div>
        `;
    }
}

function renderAwaitFeedbackTasks(tasks) {
    const taskContainer = document.getElementById("await-feedback-cards"); // Ensure there's a container with this ID in your HTML
    taskContainer.innerHTML = ""; // Clear existing tasks before rendering new ones

    let awaitFeedbackTasks = tasks.filter(task => task.boardCategory === "await-feedback");

    for (let i = 0; i < awaitFeedbackTasks.length; i++) {
        const task = awaitFeedbackTasks[i];
        taskContainer.innerHTML += `
        <div class="single-task-card" draggable="true" ondragstart="startDragging(${task.id})">
            <p>${task.category}</p>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>${task.subtasks ? task.subtasks.join(", ") : "None"}</p>
            <p>${task.prioButton || "Not Set"}</p>
            <p>${task.assignedContacts || "None"}</p>
        </div>
        `;
    }
}

function renderDoneTasks(tasks) {
    const taskContainer = document.getElementById("done-cards"); // Ensure there's a container with this ID in your HTML
    taskContainer.innerHTML = ""; // Clear existing tasks before rendering new ones

    let doneTasks = tasks.filter(task => task.boardCategory === "done");

    for (let i = 0; i < doneTasks.length; i++) {
        const task = doneTasks[i];
        taskContainer.innerHTML += `
        <div class="single-task-card" draggable="true" ondragstart="startDragging(${task.id})">
            <p>${task.category}</p>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>${task.subtasks ? task.subtasks.join(", ") : "None"}</p>
            <p>${task.prioButton || "Not Set"}</p>
            <p>${task.assignedContacts || "None"}</p>
        </div>
        `;
    }
}

// Call loadTasks() when the page loads
window.onload = loadTasks;




