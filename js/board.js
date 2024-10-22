let Tasks = [];
let selectedPrioButton = '';
let subtasksArray = [];

const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app"; 

document.addEventListener('DOMContentLoaded', () => {
    loadTasks(); 
});

async function loadTasks() {
    try {
        let tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
        let responseToJson = await tasksResponse.json();

        let tasks = [];
        if (responseToJson) {
            Object.keys(responseToJson).forEach(key => {
                tasks.push({
                    id: key,
                    ...responseToJson[key],
                });
            });
        }

        console.log("Geladene Tasks:", tasks); 
        renderTasks(tasks);
    } catch (error) {
        console.error("Fehler beim Laden der Aufgaben:", error);
    }
}

function renderAssignedToInput() {
    let assignedToInput = document.getElementById("assigned-to-input");
    assignedToInput.innerHTML = "";

    users.forEach(user => {
        assignedToInput.innerHTML += /*html*/`
            <div class="assigned-to-list" id="assigned-to-list">
                <div class="assigned-to-list-values">
                    <div class="assigned-to-list-values-image-name">
                        <p>
                            <svg width="50" height="50">
                                <circle id="circle" cx="25" cy="25" r="20" fill="${user.color}" />
                            </svg>
                        </p>
                        <p>${user.name}</p>
                    </div>
                    <input id="checkbox-assign-to-${user.name}" type="checkbox" class="assign-checkbox" value="${user.name}">
                </div>
            </div>
        `;
    });
}

function renderTasks(tasks) {
    const todoContainer = document.getElementById("todo-tasks");
    const inProgressContainer = document.getElementById("in-progress-tasks");
    const awaitFeedbackContainer = document.getElementById("await-feedback-tasks");
    const doneContainer = document.getElementById("done-tasks");

    // Vorherige Inhalte löschen
    todoContainer.innerHTML = "";
    inProgressContainer.innerHTML = "";
    awaitFeedbackContainer.innerHTML = "";
    doneContainer.innerHTML = "";

    tasks.forEach(task => {
        let container;
        switch (task.prioButton) {
            case 'urgent':
            case 'todo':
                container = todoContainer;
                break;
            case 'in-progress':
                container = inProgressContainer;
                break;
            case 'await-feedback':
                container = awaitFeedbackContainer;
                break;
            case 'done':
                container = doneContainer;
                break;
            default:
                console.warn("Unbekannter Status:", task.prioButton);
                return; 
        }

        container.innerHTML += /*html*/`
            <div class="task-card">
                <div class="task-header">
                    <span class="task-type">${task.category}</span>
                </div>
                <h3>${task.title || task.description}</h3>
                <p>${task.description}</p>
                <div class="task-progress">
                    <progress value="${task.subtasks ? task.subtasks.length : 0}" max="2"></progress>
                    <span>${task.subtasks ? task.subtasks.length : 0}/2 Subtasks</span>
                </div>
                <div class="task-members">
                    ${task.assignedContacts ? task.assignedContacts.map(contact => `<span class="member" style="background-color: ${getColorForUser(contact)};">${contact}</span>`).join('') : ''}
                </div>
            </div>
        `;
    });
}

function getColorForUser(user) {
    const colors = {
        "Sven Väth": "#FF5733",  
        "Anastasia": "#33FF57",  

    };
    return colors[user] || "#000000";
}
