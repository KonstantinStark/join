const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";
let loadedTasks = [];

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    const searchInput = document.getElementById('task-search');
    searchInput.addEventListener('keyup', function () {
        searchTasksByTitle(this.value);
    });
});


async function renderTasks(boardElementId, boardTasks) {
    let boardElement = document.getElementById(boardElementId);
    let boardTitle = boardElement.getAttribute("title");
    if (boardTasks.length === 0) {
        boardElement.innerHTML = `
            <div class="no-tasks">
                <img src="../assets/img/notasks.png" alt="No tasks ${boardTitle}">
            </div>`;
    } else {
        await renderTasksThatExist(boardElement, boardTasks);
    }
}

function renderTasks(tasks) {
    const todoContainer = document.getElementById("todo-tasks");
    const inProgressContainer = document.getElementById("in-progress-tasks");
    const awaitFeedbackContainer = document.getElementById("await-feedback-tasks");
    const doneContainer = document.getElementById("done-tasks");

    renderTasksForContainer(todoContainer, tasks.filter(task => task.prioButton === 'todo'));
    renderTasksForContainer(inProgressContainer, tasks.filter(task => task.prioButton === 'in-progress'));
    renderTasksForContainer(awaitFeedbackContainer, tasks.filter(task => task.prioButton === 'await-feedback'));
    renderTasksForContainer(doneContainer, tasks.filter(task => task.prioButton === 'done'));
}

async function loadTasks() {
    try {
        const tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
        const responseToJson = await tasksResponse.json();
        const tasks = [];

        if (responseToJson) {
            Object.keys(responseToJson).forEach(key => {
                tasks.push({ id: key, ...responseToJson[key] });
            });
        }

        loadedTasks = tasks;
        renderTasks(tasks);
    } catch (error) {
        console.error("Fehler beim Laden der Aufgaben:", error);
    }
}

function searchTasksByTitle(searchTerm) {
    if (searchTerm) {
        const filteredTasks = loadedTasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        renderTasks(filteredTasks);
    } else {
        renderTasks(loadedTasks);
    }
}

function toggleOverlayTaks(taskId) {
    const overlay = document.getElementById("task-overlay");
    if (taskId) {
        const task = loadedTasks.find(task => task.id === taskId);
        if (task) {
            document.getElementById("overlay-category").textContent = task.category;
            document.getElementById("overlay-title").textContent = task.title;
            document.getElementById("overlay-description").textContent = task.description;
            document.getElementById("overlay-due-date").textContent = task.dueDate;
            document.getElementById("overlay-priority").textContent = task.priority;
            const assignedContactsContainer = document.getElementById("overlay-assignedContacts");
            assignedContactsContainer.innerHTML = task.assignedContacts
                ? task.assignedContacts.map(contact => `<span style="background-color: ${getColorForUser(contact)};">${contact}</span>`).join('')
                : "No contacts assigned";
            const subtasksContainer = document.getElementById("overlay-subtasks");
            subtasksContainer.innerHTML = task.subtasks
                ? task.subtasks.map(subtask => `<li><input type="checkbox" ${subtask.completed ? 'checked' : ''}> ${subtask.name}</li>`).join('')
                : "<li>No subtasks</li>";
            const overlayActionsContainer = document.getElementById("overlay-actions");
            overlayActionsContainer.innerHTML = `
                <button onclick="deleteTask('${task.id}')">🗑️ Delete</button>
                <button onclick="editTask('${task.id}')">✏️ Edit</button>
            `;
            overlay.style.display = "flex";
        }
    } else {
        overlay.style.display = "none";
    }
}

function getColorForUser(user) {
    const colors = {
        "Sven Väth": "#FF5733",
        "Anastasia": "#33FF57",
    };
    return colors[user] || "#000000";
}

function drag(event) {
    event.dataTransfer.setData("taskId", event.target.id);
}

function dropTask(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    const taskElement = document.getElementById(taskId);

    const oldColumn = taskElement.closest('.board-tasks');
    const newColumn = event.target.closest('.board-tasks');
    if (!newColumn) return;

    const newColumnId = newColumn.id;

    let newPrioButton;
    switch (newColumnId) {
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
        default:
            console.error("Ungültige Zielspalte:", newColumnId);
            return;
    }

    newColumn.appendChild(taskElement);

    updateTaskStatus(taskId.replace('task-', ''), newPrioButton)
        .then(() => {
            console.log(`Task ${taskId} erfolgreich aktualisiert.`);
            renderTasksForContainer(oldColumn, loadedTasks.filter(task => task.prioButton === oldColumn.id.replace('-tasks', '')));
            renderTasksForContainer(newColumn, loadedTasks.filter(task => task.prioButton === newPrioButton));
        })
        .catch(error => {
            console.error("Fehler beim Speichern der Verschiebung:", error);
            alert("Fehler beim Speichern der Verschiebung. Bitte erneut versuchen.");
            loadTasks();
        });
}

function renderTasksForContainer(container, tasks) {
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="no-tasks">
                <img src="../assets/img/notasks.png" alt="No tasks">
            </div>`;
    } else {
        container.innerHTML = ''; // Clear the container before rendering tasks
        tasks.forEach(task => {
            container.innerHTML += /*html*/`
            <div onclick="toggleOverlayTaks('${task.id}')" class="task-card" id="task-${task.id}" draggable="true" ondragstart="drag(event)">
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
        });
    }
}

async function updateTaskStatus(taskId, newStatus) {
    const taskIndex = loadedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        loadedTasks[taskIndex].prioButton = newStatus;
    }
    try {
        const response = await fetch(`${FIREBASE_URL}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prioButton: newStatus })
        });
        if (!response.ok) {
            throw new Error(`Fehler beim Aktualisieren in Firebase: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Task-Status:", error);
        throw error; 
    }
}

async function deleteTask(taskId) {
    try {
        await fetch(`${FIREBASE_URL}/tasks/${taskId}.json`, {
            method: 'DELETE',
        });
        loadedTasks = loadedTasks.filter(task => task.id !== taskId);
        const taskElement = document.getElementById(`task-${taskId}`);
        if (taskElement) {
            taskElement.remove();
        }
        toggleOverlayTaks();
        console.log(`Task with ID ${taskId} successfully deleted.`);
    } catch (error) {
        console.error('Error deleting the task:', error);
        alert('Error deleting the task. Please try again.');
    }
}

function editTask(taskId) {
    const task = loadedTasks.find(task => task.id === taskId);
    if (task) {
        document.getElementById('title-input').value = task.title;
        document.getElementById('description-input').value = task.description;
        document.getElementById('due-date-input').value = task.dueDate;
        document.getElementById('category-input-placeholder').textContent = task.category;
        toggleOverlayTaks();
        const updatedTask = {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            category: task.category,
            priority: task.priority,
            subtasks: task.subtasks,
            assignedContacts: task.assignedContacts
        };

        updateTaskInFirebase(task.id, updatedTask);
    }
}

async function updateTaskInFirebase(taskId, updatedTask) {
    try {
        const response = await fetch(`${FIREBASE_URL}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask),
        });

        if (response.ok) {
            console.log(`Task mit ID ${taskId} erfolgreich bearbeitet.`);
            loadTasks(); 
        } else {
            throw new Error('Fehler beim Aktualisieren des Tasks');
        }
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Tasks:', error);
        alert('Fehler beim Bearbeiten des Tasks. Bitte erneut versuchen.');
    }
}

function drag(event) {
    event.dataTransfer.setData("taskId", event.target.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function dropTask(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    const taskElement = document.getElementById(taskId);

    const oldColumn = taskElement.closest('.board-tasks');
    const newColumn = event.target.closest('.board-tasks');
    if (!newColumn) return;

    const newColumnId = newColumn.id;

    let newPrioButton;
    switch (newColumnId) {
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
        default:
            console.error("Ungültige Zielspalte:", newColumnId);
            return;
    }

    newColumn.appendChild(taskElement);

    updateTaskStatus(taskId.replace('task-', ''), newPrioButton)
        .then(() => {
            console.log(`Task ${taskId} erfolgreich aktualisiert.`);
            renderTasksForContainer(oldColumn, loadedTasks.filter(task => task.prioButton === oldColumn.id.replace('-tasks', '')));
            renderTasksForContainer(newColumn, loadedTasks.filter(task => task.prioButton === newPrioButton));
        })
        .catch(error => {
            console.error("Fehler beim Speichern der Verschiebung:", error);
            alert("Fehler beim Speichern der Verschiebung. Bitte erneut versuchen.");
            loadTasks();
        });
}

function hideTaskOverlay() {

    document.getElementById("taskOverlay").style.display = "none";
}

function showTaskOverlay() {
    document.getElementById("taskOverlay").style.display = "flex";
}