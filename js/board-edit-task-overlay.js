function pushUpdatedSubtasksToArray(taskId) {
    const task = loadedTasks.find(t => t.id === taskId);
    
    if (task) {
        // Check if task.subtasks is defined and is an array
        if (Array.isArray(task.subtasks)) {
            // Create an array of updated subtasks with taskId reference
            const updatedSubtasks = task.subtasks.map(subtask => ({
                taskId: task.id,  // Reference to the parent task ID
                title: subtask.title,
                boolean: subtask.boolean,
            }));

            // Remove any previous subtasks for this task from subtasksArray
            subtasksArray = subtasksArray.filter(subtask => subtask.taskId !== taskId);

            // Push updated subtasks into the subtasksArray
            subtasksArray.push(...updatedSubtasks);

            console.log("Updated subtasks array:", subtasksArray);  // For debugging
        } else {
            console.warn(`Subtasks for task with ID ${taskId} are not properly defined.`);
        }
    }
}

function generateSubtaskHTMLEdit (subtask, index) {
    return /*html*/ `
        <li class="subtask-list-items">
            ${subtask.title} 
            <div class="subtask-list-items-img-wrapper">
                <img src="../assets/img/add-task/pen.svg" onclick="renderSubtasksEdit(${index})" alt="Edit Subtask">
                <div class="subtask-container-js-images-devider"></div>
                <img src="../assets/img/add-task/subtask-bin.svg" onclick="removeSubtask(${index})" alt="Remove Subtask">
            </div>
        </li>
    `;
}

function showEditTaskOverlay(taskId) {
    const task = loadedTasks.find(t => t.id === taskId);

    if (!task) {
        console.error("Task not found!");
        return;
    }

    // First, update the subtasksArray
    pushUpdatedSubtasksToArray(taskId);

    // Get the overlay element
    let overlay = document.getElementById("editTaskOverlay");

    // Hide the task overlay
    document.getElementById("task-overlay").classList.add('d-none');

    // Show the edit task overlay
    overlay.classList.remove('d-none');

    // Populate the overlay with task data
    overlay.innerHTML = `
        <div class="overlay-content">
            <div id="hide-taskoverlay-btn" onclick="hideTaskOverlay()">✕</div>
            <div class="test">
                <div class="subheader">
                    <div class="subheader-wrapper">
                        <h1>Edit Task</h1>
                    </div>
                </div>

                <div class="add-task-wrapper">
                    <div class="left-side-wrapper">
                        <div class="input-fields-left-side">
                            <div class="title-input-wrapper">
                                <p class="input-headers-margin-bottom">
                                    Title <span class="required-star-markers">*</span>
                                </p>
                                <div class="input-wrapper">
                                    <input type="text" placeholder="Enter title" id="title-input" value="${task.title}">
                                    <p class="error-message" id="title-error" style="display: none;">
                                        This field is required 
                                    </p>
                                </div>
                            </div>

                            <!-- Description field -->
                            <div class="description-input-wrapper">
                                <p class="input-headers-margin-bottom">Description</p>
                                <div class="description-input">
                                    <input type="text" placeholder="Enter a Description" id="description-input" value="${task.description}">
                                </div>
                            </div>

                            <!-- Assigned to field -->
                            <div class="assigned-to-wrapper">
                                <p class="input-headers-margin-bottom">Assigned to</p>
                                <div id="assigned-to-dropdown">
                                    <div class="assigned-to-toggle-button" tabindex="0" onclick="toggleAssignedToList()">
                                        <p class="placeholder-text-non-input-tag-fields">Select contacts to assign</p>
                                        <img src="../assets/img/add-task/up-down-arrow.svg" alt="">
                                    </div>
                                    <div id="assigned-to-input" class="d-none">
                                        <div class="assigned-to-list" id="assigned-to-list"></div>
                                    </div>
                                    <div id="assigned-to-input-svg-below"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right side section with due date, priority, and category -->
                    <div class="seperator-left-right-side"></div>

                    <div class="right-side-wrapper">
                        <div class="input-fields-right-side">
                            <div class="due-date-wrapper">
                                <p class="input-headers-margin-bottom">
                                    Due Date <span class="required-star-markers">*</span>
                                </p>
                                <div class="due-date-input">
                                    <input type="date" placeholder="dd/mm/yyyy" id="due-date-input" value="${task.dueDate}">
                                </div>
                                <p class="error-message" id="due-date-error" style="display: none;">
                                    This field is required
                                </p>
                            </div>

                            <div class="prio-buttons-wrapper">
                                <p class="prio-buttons-header input-headers-margin-bottom">Prio</p>
                                <div class="prio-buttons">
                                    <button id="urgent-button" onclick="setPrioButton('urgent')">
                                        Urgent
                                        <img src="../assets/img/add-task/urgent.svg" alt="Urgent">
                                    </button>
                                    <button id="medium-button" onclick="setPrioButton('medium')">
                                        Medium
                                        <img src="../assets/img/add-task/medium.svg" alt="Medium">
                                    </button>
                                    <button id="low-button" onclick="setPrioButton('low')">
                                        Low
                                        <img src="../assets/img/add-task/low.svg" alt="Low">
                                    </button>
                                </div>
                            </div>

                            <div class="category-input-wrapper">
                                <p class="input-headers-margin-bottom">
                                    Category <span class="required-star-markers">*</span>
                                </p>
                                <div class="category-input" id="category-input" onclick="toggleRenderCategoryInput(), toggleRotate()" tabindex="0">
                                    <p class="placeholder-text-non-input-tag-fields" id="category-input-placeholder">${task.category}</p>
                                    <img src="../assets/img/add-task/up-down-arrow.svg" id="category-icon" alt="">
                                </div>
                                <p class="error-message" id="category-error" style="display: none;">
                                    This field is required
                                </p>
                                <div id="category-input-content" class="d-none">
                                    <p onclick="changeCategoryInput('Technical Task')">Technical Task</p>
                                    <p onclick="changeCategoryInput('User Story')">User Story</p>
                                </div>
                            </div>

                            <div id="subtask-default" class="subtask-input-wrapper">
                                <p class="input-headers-margin-bottom">Subtasks</p>
                                <div class="subtask-input" id="subtask-container" onclick="renderEntrySubtask()">
                                    <div id="subtask-input">
                                        Add new subtask
                                        <img src="../assets/img/add-task/plus.svg" alt="Add Subtask">
                                    </div>
                                </div>
                                <ul id="subtasks-list">
                                    ${task.subtasks.map((subtask, index) => generateSubtaskHTMLEdit(subtask, index)).join('')}
                                </ul>
                                <div class="field-required-mediaquery">
                                    <p>
                                        <span class="required-star-markers">*</span>
                                        This field is required
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Footer -->
            <footer>
                <div class="field-required">
                    <p>
                        <span class="required-star-markers">*</span>
                        This field is required
                    </p>
                </div>
                <div class="clear-create-buttons-wrapper">

                    <button class="create-task-button" onclick="validateFormEdit()">
                        <p>Ok</p>
                        <img src="../assets/img/add-task/check.svg" alt="Create">
                    </button>
                </div>
            </footer>
        </div>
    `;
}

