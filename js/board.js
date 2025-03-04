const FIREBASE_URL = "https://remotestorage-128cc-default-rtdb.europe-west1.firebasedatabase.app/";

let loadedTasks = [];

/**
 * Initializes the board by loading tasks.
 */
function initBoard() {
    loadTasks();
}

/**
 * Loads tasks from the server and filters them based on the query.
 */
async function loadTasks(query = '') {
    try {
        const tasksResponse = await fetchTasks();
        const tasks = parseTasks(tasksResponse);
        const filteredTasks = filterTasks(tasks, query);

        loadedTasks = filteredTasks;
        renderTasks(filteredTasks);
    } catch (error) {
        console.error("Can't fetch tasks:", error);
    }
}

/**
 * Fetches tasks from the server.
 */
async function fetchTasks() {
    const tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
    return await tasksResponse.json();
}

/**
 * Parses the response from the server into an array of tasks.
 */
function parseTasks(responseToJson) {
    const tasks = [];
    if (responseToJson) {
        const keys = Object.keys(responseToJson);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            tasks.push({ id: key, ...responseToJson[key] });
        }
    }
    return tasks;
}

/**
 * Filters tasks based on the query.
 */
function filterTasks(tasks, query) {
    return query ? searchTasks(tasks, query) : tasks;
}

/**
 * Renders the filtered tasks into different categories.
 */
function renderTasks(filteredTasks) {
    renderToDoTasks(filteredTasks);
    renderInProgressTasks(filteredTasks);
    renderAwaitFeedbackTasks(filteredTasks);
    renderDoneTasks(filteredTasks);
}

/**
 * Starts dragging a task.
 */
function startDragging(event, taskId) {
    event.dataTransfer.setData('taskId', taskId);
    event.target.classList.add('dragging');
}

/**
 * Ends dragging a task.
 */
function endDragging(event) {
    event.target.classList.remove('dragging');
    removeHighlight();
}

/**
 * Allows dropping a task.
 */
function allowDrop(event) {
    event.preventDefault();
    removeHighlight();
    if (event.target.classList.contains('drop-target')) {
        event.target.classList.add("grey-background");
    }
}

/**
 * Removes highlight from drop targets.
 */
function removeHighlight() {
    document.getElementById("done-cards").classList.remove("grey-background");
    document.getElementById("to-do-cards").classList.remove("grey-background");
    document.getElementById("in-progress-cards").classList.remove("grey-background");
    document.getElementById("await-feedback-cards").classList.remove("grey-background");
}

/**
 * Handles dropping a task into a new category.
 */
async function handleDrop(event, newCategory) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('taskId');
    const task = loadedTasks.find(t => t.id === taskId);

    if (task) {
        task.boardCategory = newCategory;
        await updateTaskAfterDragging(task);
        renderAllTasks();
    }
    removeHighlight();
}

/**
 * Updates a task after dragging it to a new category.
 */
async function updateTaskAfterDragging(updatedTask) {
    try {
        await fetch(FIREBASE_URL + `/tasks/${updatedTask.id}.json`, {
            method: 'PATCH',
            body: JSON.stringify(updatedTask),
        });
    } catch (error) {
        console.error("Error updating task in database:", error);
    }
}

/**
 * Renders all tasks into their respective categories.
 */
function renderAllTasks() {
    renderToDoTasks(loadedTasks);
    renderInProgressTasks(loadedTasks);
    renderAwaitFeedbackTasks(loadedTasks);
    renderDoneTasks(loadedTasks);
}

/**
 * Renders tasks in the "To Do" category.
 */
function renderToDoTasks(tasks) {
    const taskContainer = document.getElementById("to-do-cards");
    taskContainer.innerHTML = "";
    let toDoTasks = tasks.filter(task => task.boardCategory === "to-do");

    if (toDoTasks.length > 0) {
        toDoTasks.forEach(task => {
            taskContainer.innerHTML += createTaskCardHTML(task);
        });
    } else {
        taskContainer.innerHTML = '<div class="empty-task-slots">No tasks To do</div>';
    }
}

/**
 * Renders tasks in the "In Progress" category.
 */
function renderInProgressTasks(tasks) {
    const taskContainer = document.getElementById("in-progress-cards");
    taskContainer.innerHTML = "";
    let inProgressTasks = tasks.filter(task => task.boardCategory === "in-progress");

    if (inProgressTasks.length > 0) {
        inProgressTasks.forEach(task => {
            taskContainer.innerHTML += createTaskCardHTML(task);
        });
    } else {
        taskContainer.innerHTML = '<div class="empty-task-slots"">no tasks In progress</div>';
    }
}

/**
 * Renders tasks in the "Await Feedback" category.
 */
function renderAwaitFeedbackTasks(tasks) {
    const taskContainer = document.getElementById("await-feedback-cards");
    taskContainer.innerHTML = "";
    let awaitFeedbackTasks = tasks.filter(task => task.boardCategory === "await-feedback");

    if (awaitFeedbackTasks.length > 0) {
        awaitFeedbackTasks.forEach(task => {
            taskContainer.innerHTML += createTaskCardHTML(task);
        });
    } else {
        taskContainer.innerHTML = '<div class="empty-task-slots">no tasks Awaiting feeback</div>';
    }
}

/**
 * Renders tasks in the "Done" category.
 */
function renderDoneTasks(tasks) {
    const taskContainer = document.getElementById("done-cards");
    taskContainer.innerHTML = "";
    let doneTasks = tasks.filter(task => task.boardCategory === "done");

    if (doneTasks.length > 0) {
        doneTasks.forEach(task => {
            taskContainer.innerHTML += createTaskCardHTML(task);
        });
    } else {
        taskContainer.innerHTML = '<div class="empty-task-slots">No tasks Done</div>';
    }
}

/**
 * Toggles the "No Tasks" message based on the filtered tasks.
 */
function toggleNoTasksMessage(filteredTasks) {
    const noTasksMessage = document.getElementById('no-tasks-message');
    const searchInput = document.getElementById('task-search').value;

    if (searchInput === '') {
        noTasksMessage.classList.add('d-none');
    } else if (filteredTasks.length === 0) {
        noTasksMessage.classList.remove('d-none');
    } else {
        noTasksMessage.classList.add('d-none');
    }
}

/**
 * Sets the background color based on the task category.
 */
function setBackgroundColorByCategory(category) {
    if (category === "Technical Task") {
        return "technical-task";
    } else if (category === "User Story") {
        return "user-story";
    }
    return "";
}

/**
 * Calculates the progress of subtasks.
 */
function calculateSubtaskProgress(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return null;
    }

    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(st => st.boolean).length;
    const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

    return { totalSubtasks, completedSubtasks, progressPercentage };
}

/**
 * Generates checkboxes for subtasks.
 */
function generateSubtaskCheckboxes(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return "";
    }

    return subtasks.map((subtask, index) => generateSubtaskCheckboxTemplate(index, subtask)).join("");
}

/**
 * Toggles the completion status of a subtask.
 */
async function toggleSubtaskCompletion(index) {
    const taskId = document.getElementById("task-overlay").getAttribute("data-task-id");
    const task = loadedTasks.find(t => t.id === taskId);

    const subtask = task.subtasks[index];
    if (subtask) {
        subtask.boolean = !subtask.boolean;
        updateTaskProgress(task);
        await updateDatabaseCheckboxes(task);
    }
}

/**
 * Updates the database with the new subtask completion status.
 */
async function updateDatabaseCheckboxes(task) {
    const response = await fetch(`${FIREBASE_URL}/tasks/${task.id}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });

    const updatedTask = await response.json();
    console.log('Task successfully updated in Firebase', updatedTask);
}

/**
 * Updates the progress of a task based on its subtasks.
 */
function updateTaskProgress(task) {
    const progressData = calculateSubtaskProgress(task.subtasks);
    const progressBar = document.querySelector(`#task-${task.id} .progress-fill`);

    if (progressData) {
        progressBar.style.width = `${progressData.progressPercentage}%`;
        const subtaskText = document.querySelector(`#task-${task.id} .subtask-progress span`);
        subtaskText.textContent = `${progressData.completedSubtasks}/${progressData.totalSubtasks} Subtasks`;
    }
}

/**
 * Generates a user avatar.
 */
function generateUserAvatar(user) {
    return generateAvatarTemplate(user.color, user.initials);
}

/**
 * Generates avatars for assigned contacts.
 */
function generateUserAvatars(assignedContacts) {
    if (Array.isArray(assignedContacts) && assignedContacts.length > 0) {
        return assignedContacts.map(user => generateUserAvatar(user)).join("");
    }
    return "";
}

/**
 * Generates user names for a task.
 */
function generateUserNames(task) {
    if (task.assignedContacts && Array.isArray(task.assignedContacts) && task.assignedContacts.length > 0) {
        return task.assignedContacts.map(user => {
            return user.name ? `<p class="user-name">${user.name}</p>` : "<p class='user-name'>No Name</p>";
        }).join("");
    }
    return "<p class='user-name'>No Assigned Users</p>";
}

/**
 * Returns the SVG for the task priority.
 */
function getPrioSVG(prio) {
    switch (prio) {
        case 'urgent':
            return `<img src="../assets/img/add-task/urgent.svg" alt="Urgent">`;
        case 'medium':
            return `<img src="../assets/img/add-task/medium.svg" alt="Medium">`;
        case 'low':
            return `<img src="../assets/img/add-task/low.svg" alt="Low">`;
    }
}

/**
 * Creates the HTML for a task card.
 */
function createTaskCardHTML(task) {
    const categoryClass = setBackgroundColorByCategory(task.category);
    const progressData = calculateSubtaskProgress(task.subtasks);
    const userAvatars = generateUserAvatars(task.assignedContacts);

    return generateTaskCardTemplate(task, categoryClass, userAvatars, progressData);
}

/**
 * Displays the task overlay with task details.
 */
function taskCardsOverlay(taskId) {
    const overlay = document.getElementById("task-overlay");
    const task = loadedTasks.find(t => t.id === taskId);
    const overlayDetails = document.getElementById("overlay-task-details");
    const categoryClass = setBackgroundColorByCategory(task.category);
    const userAvatars = generateUserAvatars(task.assignedContacts);
    const userName = generateUserNames(task);
    const subtasksCheckboxes = generateSubtaskCheckboxes(task.subtasks);
    const taskDetailsHTML = generateTaskOverlayTemplate(task, categoryClass, userAvatars, subtasksCheckboxes, userName);

    overlayDetails.innerHTML = taskDetailsHTML;
    overlay.classList.remove("d-none");
    overlay.setAttribute("data-task-id", task.id);
}

/**
 * Closes the task overlay.
 */
function closeOverlay() {
    document.getElementById("task-overlay").classList.add("d-none");
}

/**
 * Deletes a task.
 */
async function deleteTaskBtn(taskId) {
    try {
        let response = await sendDeleteRequest(taskId);

        if (response.ok) {
            removeTaskFromLocalArray(taskId);
            removeTaskCardFromUI(taskId);
            closeTaskOverlay();
            reloadTasks();
        } else {
            console.error('Failed to delete task:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

/**
 * Sends a delete request to the server.
 */
async function sendDeleteRequest(taskId) {
    return fetch(`${FIREBASE_URL}/tasks/${taskId}.json`, { method: "DELETE" });
}

/**
 * Removes a task from the local array.
 */
function removeTaskFromLocalArray(taskId) {
    const taskIndex = loadedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        loadedTasks.splice(taskIndex, 1);
    }
}

/**
 * Removes a task card from the UI.
 */
function removeTaskCardFromUI(taskId) {
    const taskCardElement = document.getElementById(`task-card-${taskId}`);
    taskCardElement && taskCardElement.remove();
}

/**
 * Closes the task overlay.
 */
function closeTaskOverlay() {
    const overlay = document.getElementById("task-overlay");
    if (overlay) {
        overlay.classList.add("d-none");
    }
}

/**
 * Reloads tasks and renders them.
 */
function reloadTasks() {
    renderToDoTasks(loadedTasks);
    renderInProgressTasks(loadedTasks);
    renderAwaitFeedbackTasks(loadedTasks);
    renderDoneTasks(loadedTasks);
}

/**
 * Searches tasks based on the query.
 */
function searchTasks(tasks, query) {
    const searchQuery = query.toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().startsWith(searchQuery) ||
        task.description.toLowerCase().startsWith(searchQuery)
    );

    toggleNoTasksMessage(filteredTasks);

    return filteredTasks;
}

document.getElementById('task-search').addEventListener('input', function () {
    const query = this.value;
    loadTasks(query);
});

/**
 * Hides the task overlay.
 */
function hideTaskOverlay() {
    let overlay = document.getElementById("taskOverlay");
    overlay.classList.add("d-none");
}

/**
 * Renders the category menu for a task.
 */
function renderCategoryMenu(taskId) {
    const categoryMenuRef = document.getElementById(`categoryMenu-${taskId}`);
    categoryMenuRef.classList.toggle("d-none")
    categoryMenuRef.innerHTML = renderCategoryMenuTemplate(taskId);
}

/**
 * Returns the HTML template for the category menu.
 */
function renderCategoryMenuTemplate(taskId) {
    return `
    <div class="category-menu">
        <ul>
            <li onclick="moveTaskCategory('to-do', '${taskId}')">To Do</li>
            <li onclick="moveTaskCategory('in-progress', '${taskId}')">In Progress</li>
            <li onclick="moveTaskCategory('await-feedback', '${taskId}')">Await Feedback</li>
            <li onclick="moveTaskCategory('done', '${taskId}')">Done</li>
        </ul>
    </div>
    `;
}

/**
 * Moves a task to a new category.
 */
function moveTaskCategory(newCategory, taskId) {
    const task = loadedTasks.find(t => t.id === taskId);

    if (task) {
        task.boardCategory = newCategory;
        updateTaskAfterDragging(task);
        renderAllTasks();
    }
}










