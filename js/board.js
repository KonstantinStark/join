const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";
let loadedTasks = [];

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    const searchInput = document.getElementById('task-search');
    searchInput.addEventListener('keyup', function() {
        searchTasksByTitle(this.value);
    });
});

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

function renderTasks(tasks) {
    const todoContainer = document.getElementById("todo-tasks");
    const inProgressContainer = document.getElementById("in-progress-tasks");
    const awaitFeedbackContainer = document.getElementById("await-feedback-tasks");
    const doneContainer = document.getElementById("done-tasks");

    todoContainer.innerHTML = "";
    inProgressContainer.innerHTML = "";
    awaitFeedbackContainer.innerHTML = "";
    doneContainer.innerHTML = "";

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        let container;

        switch (task.prioButton) {
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
                container = todoContainer;
        }

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

            // Add overlay actions for delete and edit
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

// Drag and Drop Implementation
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

    const newColumn = event.target.closest('.board-column');
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
            return; // Keine Aktion ausführen, wenn die Zielspalte ungültig ist
    }

    // Verschieben des Tasks in die neue Spalte (nur in der UI)
    newColumn.appendChild(taskElement);

    // Speichern der Änderung in Firebase
    updateTaskStatus(taskId.replace('task-', ''), newPrioButton)
        .then(() => {
            console.log(`Task ${taskId} erfolgreich aktualisiert.`);
        })
        .catch(error => {
            console.error("Fehler beim Speichern der Verschiebung:", error);
            alert("Fehler beim Speichern der Verschiebung. Bitte erneut versuchen.");
            loadTasks(); // Lädt die ursprünglichen Tasks erneut
        });
}

async function updateTaskStatus(taskId, newStatus) {
    const taskIndex = loadedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        // Update in der lokalen Liste
        loadedTasks[taskIndex].prioButton = newStatus;
    }

    // Update in Firebase
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
        throw error; // Fehler wird nach oben weitergereicht
    }
}



async function deleteTask(taskId) {
    try {
      // Remove the task from Firebase
      await fetch(`${FIREBASE_URL}/tasks/${taskId}.json`, {
        method: 'DELETE',
      });
  
      // Remove the task from the loaded tasks list
      loadedTasks = loadedTasks.filter(task => task.id !== taskId);
  
      // Find and remove the task element from the UI
      const taskElement = document.getElementById(`task-${taskId}`);
      if (taskElement) {
        taskElement.remove();
      }
  
      console.log(`Task with ID ${taskId} successfully deleted.`);
    } catch (error) {
      console.error('Error deleting the task:', error);
      alert('Error deleting the task. Please try again.');
    }
}



function editTask(taskId) {
    const task = loadedTasks.find(task => task.id === taskId);
    if (task) {
        // Zeige das Overlay mit den Bearbeitungsfeldern an
        document.getElementById('title-input').value = task.title;
        document.getElementById('description-input').value = task.description;
        document.getElementById('due-date-input').value = task.dueDate;
        document.getElementById('category-input-placeholder').textContent = task.category;
        // etc. Füge hier Felder für Priorität, Unteraufgaben und andere Eigenschaften hinzu

        // Stelle sicher, dass das Overlay sichtbar ist
        toggleOverlayTaks();

        // Aktualisiere die Daten in Firebase
        const updatedTask = {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            category: task.category,
            priority: task.priority, // Aktualisiere je nach Bedarf
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
            loadTasks(); // Lädt die aktualisierten Tasks
        } else {
            throw new Error('Fehler beim Aktualisieren des Tasks');
        }
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Tasks:', error);
        alert('Fehler beim Bearbeiten des Tasks. Bitte erneut versuchen.');
    }
}
