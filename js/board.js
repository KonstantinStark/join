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

function renderTasks(tasks) {
    const taskContainer = document.getElementById("task-cards"); // Ensure there's a container with this ID in your HTML
    taskContainer.innerHTML = ""; // Clear existing tasks before rendering new ones

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        taskContainer.innerHTML = `
            <p> ${task.category}</p>
            <h3>${task.title}</h3>
            <p> ${task.description}</p>
            <p><${task.subtasks ? task.subtasks.join(", ") : "None"}</p>
            <p><${task.prioButton || "Not Set"}</p>
            <p> ${task.assignedContacts || "None"}</p>
            
        `;   
    }
}

// Call loadTasks() when the page loads
window.onload = loadTasks;

