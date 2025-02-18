/**
 * Generates an HTML representation of a user for assignment.
 */
function generateUserHTML(user) {
    return /*html*/ `
        <div class="assigned-to-list-values" data-user-id="${user.id}">
            <div class="assigned-to-list-values-image-name" onclick="toggleCheckbox(this)">
                <p>
                    <svg width="40" height="40">
                        <circle cx="20" cy="20" r="16" fill="${user.color}" />
                        <text x="20" y="22" text-anchor="middle" fill="white" font-size="14" font-family="Arial" dy=".35em">
                            ${user.initials}
                        </text>
                    </svg>
                </p>
                <p>${user.name}</p>
            </div>
            <input id="checkbox-assign-to-${user.id}" type="checkbox" class="assign-checkbox" value="${user.id}" onchange="getSelectedAssignedUsers()">
        </div>
    `;
}

/**
 * Generates an SVG representation of a user avatar.
 */
function generateUserSVG(user) {
    return /*html*/ `
        <svg width="40" height="40">
            <circle cx="20" cy="20" r="16" fill="${user.color}" />
            <text x="20" y="22" text-anchor="middle" fill="white" font-size="14" font-family="Arial" dy=".35em">
                ${user.initials}
            </text>
        </svg>
    `;
}

/**
 * Generates an HTML input field for entering subtasks.
 */
function generateEntrySubtaskHTML() {
    return /*html*/ `
        <div id="subtask-container-js">
            <input type="text" id="subtask-input" name="subtask" placeholder="Subtask">
            <div id="subtask-container-js-images">
                <img src="../assets/img/add-task/clear.svg" onclick="emptySubtaskArrayFull()" alt="Clear Subtask">
                <div class="subtask-container-js-images-devider"></div>
                <img src="../assets/img/add-task/subtask-check.svg" onclick="addSubtaskToArray()" alt="Add Subtask">  
            </div>
        </div>
    `;
}

/**
 * Generates an HTML representation of a subtask.
 */
function generateSubtaskHTML(subtask, index) {
    return /*html*/ `
        <li class="subtask-list-items">${subtask} 
            <div class="subtask-list-items-img-wrapper">
                <img src="../assets/img/add-task/pen.svg" onclick="renderSubtasksEdit(${index})" alt="Edit Subtask">
                <div class="subtask-container-js-images-devider"></div>
                <img src="../assets/img/add-task/subtask-bin.svg" onclick="removeSubtask(${index})" alt="Remove Subtask">
            </div>
        </li>
    `;
}

/**
 * Generates an HTML input field for editing a subtask.
 */
function generateSubtaskEditHTML(subtask, index) {
    return /*html*/ `
        <li class="subtask-list-items">
            <input id="edited-input-value-subtask-${index}" type="text" value="${subtask}">
            <div class="edit-images-subtasks-wrapper">
                <img src="../assets/img/add-task/subtask-bin.svg" onclick="removeSubtask(${index})" alt="Delete">
                <div class="subtask-container-js-images-devider"></div>
                <img src="../assets/img/add-task/subtask-check.svg" onclick="updateSubtask(${index})" alt="Save">
            </div>
        </li>
    `;
}
