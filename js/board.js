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
        
        renderTasks(tasks);
    } catch (error) {
        console.error("cant fetch tasks:", error);
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function dropTask(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const task = document.getElementById(data);
    event.target.appendChild(task);
}

function dragEnd(event) {
    // Optional: Handle any cleanup after dragging ends
}

// Ensure each task has a unique ID
function renderTasks(tasks) {
    const taskContainer = document.getElementById("task-cards");
    taskContainer.innerHTML = "";

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const taskElement = document.createElement("div");
        taskElement.className = "task";
        taskElement.id = `task-${task.id}`;
        taskElement.draggable = true;
        taskElement.ondragstart = drag;
        taskElement.ondragend = dragEnd;
        taskElement.innerHTML = `
            <p>${task.category}</p>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>${task.subtasks ? task.subtasks.join(", ") : "None"}</p>
            <p>${task.prioButton || "Not Set"}</p>
            <p>${task.assignedContacts || "None"}</p>
        `;
        taskContainer.appendChild(taskElement);
    }
}

// Call loadTasks() when the page loads
window.onload = loadTasks;

