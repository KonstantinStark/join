const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app";

let loadedTasks = [];  // Variable, um die geladenen Aufgaben zu speichern

document.addEventListener('DOMContentLoaded', () => {
    loadTasks(); 

    // Event Listener für die Suchfunktion
    const searchInput = document.getElementById('task-search');
    searchInput.addEventListener('keyup', function() {
        searchTasksByTitle(this.value);
    });
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

        loadedTasks = tasks;  // Speichere die geladenen Tasks in der Variable
        console.log("Geladene Tasks:", tasks);
        renderTasks(tasks);  // Zeige alle geladenen Tasks an
    } catch (error) {
        console.error("Fehler beim Laden der Aufgaben:", error);
    }
}

// Funktion, um Tasks nach dem Titel zu durchsuchen
function searchTasksByTitle(searchTerm) {
    if (searchTerm) {
        // Filter die Tasks nach dem Suchbegriff im Titel
        let filteredTasks = loadedTasks.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()));
        renderTasks(filteredTasks);  // Zeige nur die gefilterten Tasks an
    } else {
        // Zeige alle Tasks an, wenn das Suchfeld leer ist
        renderTasks(loadedTasks);
    }
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

    // Verwende eine for-Schleife anstelle von forEach
    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
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
                container = todoContainer;  // Fallback-Container
        }

        container.innerHTML += /*html*/`
        <div class="task-card" id="task-${task.id}" draggable="true" ondragstart="drag(event)">
            <div class="task-header">
                <span class="task-type ${task.category.toLowerCase().replace(' ', '-')}">${task.category}</span>
            </div>
            <h3>${task.title}</h3>
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
    }
}

function getColorForUser(user) {
    const colors = {
        "Sven Väth": "#FF5733",  
        "Anastasia": "#33FF57",  
    };
    return colors[user] || "#000000";
}

// Drag-Event starten
function drag(event) {
    event.dataTransfer.setData("taskId", event.target.id); // ID des gezogenen Tasks speichern
}

// Drag zulassen
function allowDrop(event) {
    event.preventDefault();  // Ermöglicht das Droppen
}

// Task in neue Spalte verschieben
function dropTask(event) {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("taskId");  // ID des Tasks abrufen
    const taskElement = document.getElementById(taskId);  // Task-Element abrufen
    const newStatus = event.target.closest('.board-column').id;  // Neue Spalte ermitteln

    // Task in die neue Spalte verschieben
    event.target.closest('.board-column').appendChild(taskElement);

    // Task-Status basierend auf der neuen Spalte aktualisieren
    let newPrioButton;
    switch (newStatus) {
        case 'todo-tasks':
            newPrioButton = 'todo';
            break;
        case 'in-progress-tasks':
            newPrioButton = 'in-progress';
            break;
        case 'await-feedback-tasks':
            newPrioButton = 'await-feedback';
            break;
        case 'done-tasks':
            newPrioButton = 'done';
            break;
    }

    // Firebase mit neuem Status aktualisieren
    updateTaskStatus(taskId.replace('task-', ''), newPrioButton);
}
