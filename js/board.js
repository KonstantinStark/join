const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app";
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







// const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app";
// let loadedTasks = [];

// document.addEventListener('DOMContentLoaded', () => {
//     loadTasks();
//     const searchInput = document.getElementById('task-search');
//     searchInput.addEventListener('keyup', function() {
//         searchTasksByTitle(this.value);
//     });
// });

// async function loadTasks() {
//     const localTasks = JSON.parse(localStorage.getItem('tasks'));
    
//     if (localTasks) {
//         loadedTasks = localTasks;
//         renderTasks(loadedTasks);
//     } else {
//         try {
//             let tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
//             let responseToJson = await tasksResponse.json();
//             let tasks = [];
//             if (responseToJson) {
//                 Object.keys(responseToJson).forEach(key => {
//                     tasks.push({ id: key, ...responseToJson[key] });
//                 });
//             }
//             loadedTasks = tasks;
//             renderTasks(tasks);
//             localStorage.setItem('tasks', JSON.stringify(loadedTasks));
//         } catch (error) {
//             console.error("Fehler beim Laden der Aufgaben:", error);
//         }
//     }
// }

// function searchTasksByTitle(searchTerm) {
//     if (searchTerm) {
//         let filteredTasks = loadedTasks.filter(task => 
//             task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
//             (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
//         );
//         renderTasks(filteredTasks);
//     } else {
//         renderTasks(loadedTasks);
//     }
// }

// function renderTasks(tasks) {
//     const todoContainer = document.getElementById("todo-tasks");
//     const inProgressContainer = document.getElementById("in-progress-tasks");
//     const awaitFeedbackContainer = document.getElementById("await-feedback-tasks");
//     const doneContainer = document.getElementById("done-tasks");

//     todoContainer.innerHTML = "";
//     inProgressContainer.innerHTML = "";
//     awaitFeedbackContainer.innerHTML = "";
//     doneContainer.innerHTML = "";

//     for (let i = 0; i < tasks.length; i++) {
//         let task = tasks[i];
//         let container;

//         switch (task.prioButton) {
//             case 'urgent':
//             case 'todo':
//                 container = todoContainer;
//                 break;
//             case 'in-progress':
//                 container = inProgressContainer;
//                 break;
//             case 'await-feedback':
//                 container = awaitFeedbackContainer;
//                 break;
//             case 'done':
//                 container = doneContainer;
//                 break;
//             default:
//                 container = todoContainer;
//         }

//         container.innerHTML += /*html*/`
//         <div onclick="toggleOverlayTaks('${task.id}')" class="task-card" id="task-${task.id}" draggable="true" ondragstart="drag(event)">
//             <div class="task-header">
//                 <span class="task-type ${task.category.toLowerCase().replace(' ', '-')}">${task.category}</span>
//             </div>
//             <h3>${task.title}</h3>
//             <p>${task.description}</p>
//             <div class="task-progress">
//                 <progress value="${task.subtasks ? task.subtasks.length : 0}" max="2"></progress>
//                 <span>${task.subtasks ? task.subtasks.length : 0}/2 Subtasks</span>
//             </div>
//             <div class="task-members">
//                 ${task.assignedContacts ? task.assignedContacts.map(contact => `<span class="member" style="background-color: ${getColorForUser(contact)};">${contact}</span>`).join('') : ''}
//             </div>
//         </div>
//         `;
//     }
// }

// function toggleOverlayTaks(taskId) {
//     const overlay = document.getElementById("task-overlay");

//     if (taskId) {
//         const task = loadedTasks.find(task => task.id === taskId);
//         if (task) {
//             document.getElementById("overlay-category").textContent = task.category;
//             document.getElementById("overlay-title").textContent = task.title;
//             document.getElementById("overlay-description").textContent = task.description;
//             document.getElementById("overlay-due-date").textContent = task.dueDate;
//             document.getElementById("overlay-priority").textContent = task.priority;

//             const assignedContactsContainer = document.getElementById("overlay-assignedContacts");
//             assignedContactsContainer.innerHTML = task.assignedContacts
//                 ? task.assignedContacts.map(contact => `<span style="background-color: ${getColorForUser(contact)};">${contact}</span>`).join('')
//                 : "No contacts assigned";

//             const subtasksContainer = document.getElementById("overlay-subtasks");
//             subtasksContainer.innerHTML = task.subtasks
//                 ? task.subtasks.map(subtask => `<li><input type="checkbox" ${subtask.completed ? 'checked' : ''}> ${subtask.name}</li>`).join('')
//                 : "<li>No subtasks</li>";

//             overlay.style.display = "flex";
//         }
//     } else {
//         overlay.style.display = "none";
//     }
// }

// function getColorForUser(user) {
//     const colors = {
//         "Sven Väth": "#FF5733",  
//         "Anastasia": "#33FF57",  
//     };
//     return colors[user] || "#000000";
// }

// function drag(event) {
//     event.dataTransfer.setData("taskId", event.target.id);
// }

// function allowDrop(event) {
//     event.preventDefault();
// }

// function dropTask(event) {
//     event.preventDefault();
//     const taskId = event.dataTransfer.getData("taskId");
//     const taskElement = document.getElementById(taskId);
//     const newStatus = event.target.closest('.board-column').id;

//     event.target.closest('.board-column').appendChild(taskElement);

//     let newPrioButton;
//     switch (newStatus) {
//         case 'todo-tasks':
//             newPrioButton = 'todo';
//             break;
//         case 'in-progress-tasks':
//             newPrioButton = 'in-progress';
//             break;
//         case 'await-feedback-tasks':
//             newPrioButton = 'await-feedback';
//             break;
//         case 'done-tasks':
//             newPrioButton = 'done';
//             break;
//     }

//     updateTaskStatus(taskId.replace('task-', ''), newPrioButton);
// }

// async function updateTaskStatus(taskId, newStatus) {
//     const taskIndex = loadedTasks.findIndex(task => task.id === taskId);
//     if (taskIndex !== -1) {
//         loadedTasks[taskIndex].prioButton = newStatus;
//         localStorage.setItem('tasks', JSON.stringify(loadedTasks));
//     }

//     try {
//         await fetch(`${FIREBASE_URL}/tasks/${taskId}.json`, {
//             method: 'PATCH',
//             body: JSON.stringify({ prioButton: newStatus })
//         });
//     } catch (error) {
//         console.error("Fehler beim Aktualisieren des Task-Status:", error);
//     }
// }

// function toggleHamburgerMenu() {
//     document.getElementById("hamburger-menu").classList.toggle("d-none");
// }


// function deleteTask() {
//     const taskId = document.getElementById("overlay-task-id").value;

//     if (taskId) {
//         const taskRef = firebase.database().ref('tasks/' + taskId);
//         taskRef.remove()
//             .then(() => {
//                 removeTaskFromUI(taskId);
//                 toggleOverlayTaks();
//             })
//             .catch((error) => {
//                 console.error('Error deleting task:', error);
//             });
//     }
// }

// function editTask() {
//     const taskId = document.getElementById("overlay-task-id").value;
//     const title = document.getElementById("overlay-title").innerText;
//     const description = document.getElementById("overlay-description").innerText;
//     const dueDate = document.getElementById("overlay-due-date").innerText;
//     const priority = document.getElementById("overlay-priority").innerText;
//     const assignedTo = [];

//     const updatedTask = {
//         title,
//         description,
//         dueDate,
//         priority,
//         assignedTo
//     };

//     if (taskId) {
//         const taskRef = firebase.database().ref('tasks/' + taskId);
//         taskRef.update(updatedTask)
//             .then(() => {
//                 updateTaskInUI(taskId, updatedTask);
//                 toggleOverlayTaks();
//             })
//             .catch((error) => {
//                 console.error('Error updating task:', error);
//             });
//     }
// }

// function removeTaskFromUI(taskId) {
//     const taskElement = document.getElementById(taskId);
//     if (taskElement) {
//         taskElement.remove();
//     }
// }

// function updateTaskInUI(taskId, updatedTask) {
//     const taskElement = document.getElementById(taskId);
//     if (taskElement) {
//         taskElement.querySelector('.task-title').innerText = updatedTask.title;
//         taskElement.querySelector('.task-description').innerText = updatedTask.description;
//         taskElement.querySelector('.task-due-date').innerText = updatedTask.dueDate;
//         taskElement.querySelector('.task-priority').innerText = updatedTask.priority;
//     }
// }