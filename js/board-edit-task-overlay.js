let editAssignedUsersfromCheckboxes = [];
let editSubtaskArray = [];
let taskID;
let editSelectedPrioButton  = '';

/**
 * Hides the edit task overlay.
 */
function hideEditTaskOverlay() {
    document.getElementById("editTaskOverlay").classList.toggle("d-none");
}

/**
 * Shows the edit task overlay.
 */
function showEditTaskOverlay(taskID) {
    document.getElementById("editTaskOverlay").classList.toggle("d-none");
    resetAssignedUsersCheckboxes();
    const task = loadedTasks.find(t => t.id === taskID);
    editRenderEditTaskOverlayContentFromDatabase(task);
}

/**
 * Renders the edit task overlay content from the database.
 */
function editRenderEditTaskOverlayContentFromDatabase(task) {
    document.getElementById("edit-title-input").value = task.title;
    document.getElementById("edit-description-input").value = task.description;
    document.getElementById("edit-due-date-input").value = task.dueDate;
    editSetPrioButton(task.prioButton);
    document.getElementById('edit-category-input-placeholder').innerHTML = task.category;
    editAssignUsersFromDatabase(task.assignedContacts);
    editSubtasksFromDatabase(task.subtasks);
    renderFooter(task);
}

/**
 * Toggles the assigned to list.
 */
function editToggleAssignedToList() {
    let toggleAssignedToListRef = document.getElementById('edit-assigned-to-container');
    toggleAssignedToListRef.classList.toggle('d-none');
    let editRenderUserSvgRef = document.getElementById('edit-render-assigned-svg');
    editRenderUserSvgRef.classList.toggle('d-none');
}

/**
 * Renders the assigned to users list.
 */
function editRenderAssignedToUsersList() {
    let assignedToListRef = document.getElementById("edit-assigned-to-list");
    assignedToListRef.innerHTML = "";
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        assignedToListRef.innerHTML += editRenderAssignedToUsersListTemplate(user);
    }
}

/**
 * Checks the assigned users.
 */
function editCheckedAssignedUsers(userId) {
    let checkBox = document.getElementById(`checkbox-${userId}`);
    if (checkBox.checked == true) {
        addUserToAssignedArray(userId);
        editChangeBackgroundColor(userId, true);
    } else {
        removeUserFromAssignedArray(userId);
        editChangeBackgroundColor(userId, false);
    }
    editRenderUserSvg();
}

/**
 * Adds the user to the assigned users array.
 */
function addUserToAssignedArray(userId) {
    let checkedUser = users.find(user => user.id === userId);
    if (checkedUser && !editAssignedUsersfromCheckboxes.includes(checkedUser)) {
        editAssignedUsersfromCheckboxes.push(checkedUser);
    }
}

/**
 * Removes the user from the assigned users array.
 */
function removeUserFromAssignedArray(userId) {
    let checkedUserIndex = editAssignedUsersfromCheckboxes.findIndex(user => user.id === userId);
    if (checkedUserIndex !== -1) {
        editAssignedUsersfromCheckboxes.splice(checkedUserIndex, 1);
    }
}

/**
 * Changes the background color of the assigned user.
 */
function editChangeBackgroundColor(userId, isChecked) {
    let assignedListItem = document.getElementById(`assigned-list-items-${userId}`);
    if (assignedListItem) {
        if (isChecked) {
            assignedListItem.classList.add('bg-color-black');
        } else {
            assignedListItem.classList.remove('bg-color-black');
        }
    }
}

/**
 * Renders the user SVG.
 */
function editRenderUserSvg() {
    let editRenderUserSvgRef = document.getElementById('edit-render-assigned-svg');
    editRenderUserSvgRef.innerHTML = "";
    editAssignedUsersfromCheckboxes.forEach(user => {
        if (user) {
            editRenderUserSvgRef.innerHTML += editRenderUserSvgTemplate(user);
        }
    });
}

/**
 * Resets the assigned users checkboxes.
 */
function resetAssignedUsersCheckboxes() {
    editAssignedUsersfromCheckboxes = [];
    let checkboxes = document.querySelectorAll('.assigned-to-checkboxes');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const userId = checkbox.value;
        editChangeBackgroundColor(userId, false);
    });
}

/**
 * Assigns users from the database.
 */
function editAssignUsersFromDatabase(assignedContactsFromTask) {
    editAssignedUsersfromCheckboxes = [...assignedContactsFromTask];
    assignedContacts.forEach(contact => {
        if (!editAssignedUsersfromCheckboxes.some(user => user.id === contact.id)) {
            editAssignedUsersfromCheckboxes.push(contact);
        }
    });
    editRenderVisualsForAssignedUsersfromDatabase();
}

/**
 * Renders visuals for assigned users from the database.
 */
function editRenderVisualsForAssignedUsersfromDatabase() {
    editAssignedUsersfromCheckboxes.forEach(user => {
        let checkBox = document.getElementById(`checkbox-${user.id}`);
        if (checkBox) {
            checkBox.checked = true;
        }
        editChangeBackgroundColor(user.id, true);
    });
    editRenderUserSvg();
}

/**
 * Sets the priority button.
 */
function editSetPrioButton(editPrio) {
    editSelectedPrioButton = editPrio;
    document.getElementById('edit-urgent-button').classList.remove('active', 'urgent');
    document.getElementById('edit-medium-button').classList.remove('active', 'medium');
    document.getElementById('edit-low-button').classList.remove('active', 'low');
    if (editPrio === 'urgent') {
        document.getElementById('edit-urgent-button').classList.add('active', 'urgent');
    } else if (editPrio === 'medium') {
        document.getElementById('edit-medium-button').classList.add('active', 'medium');
    } else if (editPrio === 'low') {
        document.getElementById('edit-low-button').classList.add('active', 'low');
    }
}

/**
 * Toggles the render category input.
 */
function editToggleRenderCategoryInput() {
    let renderCategoryInputToggle = document.getElementById('edit-category-input-content');
    renderCategoryInputToggle.classList.toggle('d-block');
    document.addEventListener('click', function(event) {
        const categoryInputWrapper = document.getElementById('edit-category-input');
        if (!categoryInputWrapper.contains(event.target)) {
            renderCategoryInputToggle.classList.remove('d-block');
        }
    });
}

/**
 * Changes the category input.
 */
function editChangeCategoryInput(editSelectedCategory) {
    const categoryInputPlaceholderRef = document.getElementById('edit-category-input-placeholder');
    const renderCategoryInputToggle = document.getElementById('edit-category-input-content');
    const placeholderText = 'Select task category';
    categoryInputPlaceholderRef.innerHTML = (editSelectedCategory === placeholderText || editSelectedCategory === categoryInputPlaceholderRef.innerHTML) 
        ? placeholderText 
        : editSelectedCategory;
    renderCategoryInputToggle.classList.add('d-none');
}

document.getElementById('edit-category-input-placeholder').addEventListener('click', function() {
    editChangeCategoryInput('Select task category');
});

/**
 * Adds a subtask input to the array.
 */
function editAddSubtaskInputToArray() {
    let renderSubtaskListRef = document.getElementById('editSubtaskInput');
    let subtaskValue = renderSubtaskListRef.value.trim();
    if (subtaskValue) {
        let newSubtask = { 
            id: editSubtaskArray.length + 1,
            title: subtaskValue, 
            boolean: false 
        };
        editSubtaskArray.push(newSubtask);
        renderSubtaskListRef.value = '';
    }
    editRenderSubtaskInputEntrys();
}

/**
 * Renders the subtask input entries.
 */
function editRenderSubtaskInputEntrys() {
    let renderSubtaskInputEntrysRef = document.getElementById('editSubtaskList');
    let subtasks = '';
    for (let i = 0; i < editSubtaskArray.length; i++) {
        let subtask = editSubtaskArray[i];
        subtasks += renderEditRSubtaskInputEntrysTemplate(subtask);
    }
    renderSubtaskInputEntrysRef.innerHTML = subtasks;
}

/**
 * Handles editing a specific subtask.
 */
function editEditSubtaskFromList(id) {
    let subtask = editSubtaskArray.find(task => task.id === id);
    if (subtask) {
        let editSubtaskListItemsRef = document.getElementById(`editSubtaskListItems-${id}`);
        editSubtaskListItemsRef.classList.add('border-bottom-turquoise');
        editSubtaskListItemsRef.innerHTML = editEditSubtaskFromListTemplate(subtask);  
    }
}

/**
 * Saves the edit of a subtask.
 */
function saveSubtaskEdit(id) {
    let editedValue = document.getElementById(`editSubtaskInput-${id}`).value;
    let subtask = editSubtaskArray.find(task => task.id === id);
    if (subtask) {
        subtask.title = editedValue;
        editRenderSubtaskInputEntrys();
    }
}

/**
 * Cancels editing the subtask.
 */
function cancelEdit(id) {
    editSubtaskArray = editSubtaskArray.filter(task => task.id !== id);
    editRenderSubtaskInputEntrys();
}

/**
 * Deletes the subtask.
 */
function deleteSubtask(id) {
    editSubtaskArray = editSubtaskArray.filter(task => task.id !== id);
    editRenderSubtaskInputEntrys();
}

/**
 * Loads subtasks from the database.
 */
function editSubtasksFromDatabase(taskSubtasksFromTask) {
    if (Array.isArray(taskSubtasksFromTask)) {
        editSubtaskArray = [...taskSubtasksFromTask];
        subtasksArray.forEach(subtask => {
            if (!editSubtaskArray.some(existingSubtask => existingSubtask.id === subtask.id)) {
                editSubtaskArray.push(subtask);
            }
        });
        editAddSubtaskInputToArray();
    } 
}

/**
 * Renders the footer.
 */
function renderFooter(task) {
    let renderFooterRef = document.getElementById('editTaskFooter');
    renderFooterRef.innerHTML = renderFooterTemplate(task);
}

/**
 * Saves the task edit.
 */
function saveTaskEdit(taskID) {
    const newTitle = document.getElementById("edit-title-input").value;
    const newDescription = document.getElementById("edit-description-input").value;
    const newDueDate = document.getElementById("edit-due-date-input").value;
    const newContacts = editAssignedUsersfromCheckboxes;
    const newPrioButton = editSelectedPrioButton;
    const newCategory = document.getElementById("edit-category-input-placeholder").innerHTML;
    const newSubtasks = editSubtaskArray;

    const updatedData = {
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate,
        assignedContacts: newContacts,
        prioButton: newPrioButton,
        category: newCategory,
        subtasks: newSubtasks,
    };

    updateTaskInDatabase(taskID, updatedData)
        .then(() => {
            taskCardsOverlay(taskID);
            loadTasks();
        })
        .catch((error) => {
            console.error("Error updating task:", error);
        });

    document.getElementById("editTaskOverlay").classList.toggle("d-none");
}

/**
 * Updates the task in the database.
 */
async function updateTaskInDatabase(taskID, updatedData) {
    const taskUrl = `${FIREBASE_URL}/tasks/${taskID}.json`;
    const response = await fetch(taskUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
        throw new Error('Failed to update task');
    }

    const taskIndex = loadedTasks.findIndex(t => t.id === taskID);
    if (taskIndex !== -1) {
        loadedTasks[taskIndex] = { ...loadedTasks[taskIndex], ...updatedData };
    }

    return response;
}









