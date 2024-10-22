let users = [];
const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";

// Function to initialize loading
function init() {
    loadUsers();
    loadTasks();
}

// Function to load users (already implemented)
function loadUsers() {
    // Your existing code to load users
}

// Function to load tasks from Firebase
async function loadTasks() {
    try {
        const response = await fetch(`${FIREBASE_URL}/tasks.json`);
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

// Function to render tasks into the board
function renderTasks(tasks) {
    const todoColumn = document.querySelector('.board-column.todo .no-tasks');
    const inProgressColumn = document.querySelector('.board-column.in-progress');
    const awaitFeedbackColumn = document.querySelector('.board-column.await-feedback');
    const doneColumn = document.querySelector('.board-column.done');

    // Clear existing task content
    todoColumn.innerHTML = '';
    inProgressColumn.innerHTML = '';
    awaitFeedbackColumn.innerHTML = '';
    doneColumn.innerHTML = '';

    for (const key in tasks) {
        if (tasks.hasOwnProperty(key)) {
            const task = tasks[key];
            
            const taskCard = createTaskCard(task);

            // Assign tasks to specific columns based on their progress
            if (task.status === "todo") {
                todoColumn.appendChild(taskCard);
            } else if (task.status === "in-progress") {
                inProgressColumn.appendChild(taskCard);
            } else if (task.status === "await-feedback") {
                awaitFeedbackColumn.appendChild(taskCard);
            } else if (task.status === "done") {
                doneColumn.appendChild(taskCard);
            }
        }
    }
}

// Function to create a task card element
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card', task.category.toLowerCase().replace(/\s+/g, '-'));

    taskCard.innerHTML = `
        <div class="task-header">
            <span class="task-type">${task.category}</span>
        </div>
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        ${task.subtasks ? renderSubtasks(task.subtasks) : ''}
        <div class="task-members">
            ${task.assignedContacts.map(contact => `<span class="member">${contact}</span>`).join('')}
        </div>
    `;
    return taskCard;
}

// Function to render subtasks if available
function renderSubtasks(subtasks) {
    return `
        <div class="task-progress">
            <progress value="${subtasks.length}" max="${subtasks.length}"></progress>
            <span>${subtasks.length}/${subtasks.length} Subtasks</span>
        </div>
    `;
}

// Call the init function to start everything
init();
