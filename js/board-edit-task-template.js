/**
 * Renders the assigned to users list template.
 */
function editRenderAssignedToUsersListTemplate(user) {
    return /*html*/ `
        <label for="checkbox-${user.id}">
            <div class="assigned-to-list-values" id="assigned-list-items-${user.id}">
                <div class="assigned-to-list-values-image-name" >
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
                        
                <input 
                    type="checkbox" 
                    id="checkbox-${user.id}" 
                    class="assigned-to-checkboxes" 
                    value="${user.id}" 
                    onchange="editCheckedAssignedUsers('${user.id}')"> <!-- Pass user.id as a string -->

         </div>
        </label>
    `;
}

/**
 * Renders the user SVG template.
 */
function editRenderUserSvgTemplate(user) {
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
 * Renders the subtask input entries template.
 */
function renderEditRSubtaskInputEntrysTemplate(subtask) {
    return /*html*/ `
    
        <div id="editSubtaskListItems-${subtask.id}">
            <ul>
                <li class="edit-subtask-list-items-single">
                    <span>${subtask.title}</span>
                    <div class="edit-subtask-list-items-single-imgs">
                        <img src="../assets/img/add-task/subtask-check.svg" class="d-none" onclick="editEditSubtaskFromList(${subtask.id})" alt="Edit Subtask">
                        <img src="../assets/img/add-task/clear.svg" class="d-none" onclick="deleteSubtask(${subtask.id})" alt="Clear Subtask">
                    </div>
                </li>
            </ul>  
        </div>
    `;
}

/**
 * Renders the editable version of the subtask (input field).
 */
function editEditSubtaskFromListTemplate(subtask) {
    return /*html*/ `
        <div class="edit-subtask-list-items" id="editSubtaskListItems-${subtask.id}">
            <ul>
                <li class="edit-subtask-list-items-single">
                    <input type="text" value="${subtask.title}" id="editSubtaskInput-${subtask.id}">
                    <div class="edit-subtask-list-items-single-imgs">
                        <img src="../assets/img/add-task/subtask-check.svg" onclick="saveSubtaskEdit(${subtask.id})" alt="Save Subtask">
                        <div class="seperator-imgs"></div>
                        <img src="../assets/img/add-task/clear.svg" onclick="cancelEdit(${subtask.id})" alt="Cancel Edit">
                    </div>
            
                </li>
            </ul>  
        </div>
    `;
}

/**
 * Renders the footer template.
 */
function renderFooterTemplate(task) {
    return /*html*/ `
    <div class="field-required">
        <p>
            <span class="required-star-markers">*</span>
            This field is required
        </p>
    </div>
    <div class="clear-create-buttons-wrapper" id="okButtonWrapper">
        <button class="create-task-button" onclick="saveTaskEdit('${task.id}')">
            <p>Ok</p> 
            <img src="../assets/img/add-task/check.svg" alt="Create">
        </button>
    </div>
    `;
}