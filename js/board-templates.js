/**
 * Generates the task card template.
 */
function generateTaskCardTemplate(task, categoryClass, userAvatars, progressData) {
    return `
    <div class="task-card-template-wrapper">
        <div id="task-${task.id}" class="single-task-card" draggable="true" onclick="taskCardsOverlay('${task.id}')"
            ondragstart="startDragging(event, '${task.id}')" ondrop="handleDrop(event, '${task.boardCategory}')" ondragover="allowDrop(event)">
            <div class="mobile-category-menu">
                <!-- Category Menu will be rendered here -->
                <div id="categoryMenu-${task.id}" class="d-none rendered-category-menu"></div>
            </div> 
            <div class="task-cards-header-wrapper">
                <p class="task-category ${categoryClass}">${task.category}</p>
            </div>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            ${progressData ? `
                <div class="subtask-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressData.progressPercentage}%;"></div>
                    </div>
                    <span>${progressData.completedSubtasks}/${progressData.totalSubtasks} Subtasks</span>
                </div>` : ""}
            <div class="assigned-users-prio-button-wrapper">
                <div class="assigned-users">
                    ${userAvatars || ""}
                </div>
                <div class="prio-button-board">
                    <p>${task.prioButton ? getPrioSVG(task.prioButton) : getPrioSVG('medium')}</p>
                </div>
            </div>
        </div>
        <p onclick="renderCategoryMenu('${task.id}')" class="mobile-category-menu-btn" >&#8597</p>
    </div>
    `;
}

/**
 * Generates the task overlay template with subtasks checkboxes.
 */
function generateTaskOverlayTemplate(task, categoryClass, userAvatars, subtasksCheckboxes, userName) {
    return `
    <div class="task-category ${categoryClass}">${task.category}</div>
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <p>Assigned to:</p>
    <div class="assigned-users-overlay">
        <span class="assigned-users-overlay-items" >${userAvatars || ""} </span> 
        <span class="assigned-users-overlay-items">${userName || ""} </span> 
    </div>
    <div class="subtasks-list">
        <p>Subtasks:</p>
        ${subtasksCheckboxes || "No Subtasks"}
    </div>
    <div class="prio-button-board">
        <p>${task.prioButton ? getPrioSVG(task.prioButton) : getPrioSVG('medium')}</p>
    </div>
    <div class="task-action-buttons">
        <img class="delete-button" src="../assets/img/Property 1=Default.png" alt="Delete" onclick="deleteTaskBtn('${task.id}')">
        <span class="divider"></span>
        <img class="edit-button" src="../assets/img/Property 1=Edit2.png" alt="Edit" onclick="showEditTaskOverlay('${task.id}')">
    </div>
    `;
}

/**
 * Generates the avatar template.
 */
function generateAvatarTemplate(color, initials) {
    return `
        <svg width="40" height="40">
            <circle cx="20" cy="20" r="16" fill="${color}" />
            <text x="20" y="22" text-anchor="middle" fill="white" font-size="14" font-family="Arial" dy=".35em">
                ${initials}
            </text>
        </svg>  
    `;
}

/**
 * Generates a single subtask checkbox template.
 */
function generateSubtaskCheckboxTemplate(index, subtask) {
    return `
        <div class="subtask">
            <input type="checkbox" class="subtask-checkbox" id="subtask-${index}" ${subtask.boolean ? "checked" : ""} 
                onclick="toggleSubtaskCompletion(${index}, '${subtask.title}')">
            <label for="subtask-${index}">${subtask.title}</label>
        </div>
    `;
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

