let users = [];
let selectedPrioButton = '';
let subtasksArray = [];

console.log(loadUsers());

async function loadUsers() {
    let userResponse = await fetch(FIREBASE_URL + '/users.json');
    let responseToJson = await userResponse.json();

    users = [];
    if (responseToJson) {
        Object.keys(responseToJson).forEach(key => {
            users.push({
                id: key,
                name: responseToJson[key]['name'],
                email: responseToJson[key]['email'],
                color: responseToJson[key]['color'],
                initials: responseToJson[key]['initials']
            });
        });
    }

    console.log(users);
    renderAssignedToInput();
}

function renderAssignedToInput() {
    let assignedToList = document.getElementById("assigned-to-list");
    assignedToList.innerHTML = "";

    for (let i = 0; i < users.length; i++) {
        let user = users[i];

        assignedToList.innerHTML += /*html*/`
            <div class="assigned-to-list-values">
                <div class="assigned-to-list-values-image-name">
                    <p>
                        <svg width="50" height="50">
                            <circle cx="25" cy="25" r="20" fill="${user.color}" />
                            <text x="25" y="30" text-anchor="middle" fill="white" font-size="18" font-family="Arial" dy=".3em">
                                ${user.initials}
                            </text>
                        </svg>
                    </p>
                    <p>${user.name}</p>
                </div>
                <input id="checkbox-assign-to-${user.name}" type="checkbox" class="assign-checkbox" value="${user.name}">
            </div>
        `;
    } 
}

function getSelectedAssignedUsers() {
    const checkboxes = document.querySelectorAll('.assign-checkbox');
    let assignedContacts  = [];

    checkboxes.forEach(checkbox => {
        let assignedToValue = checkbox.closest('.assigned-to-list-values');

        if (checkbox.checked) {
            assignedContacts.push(checkbox.value);
            assignedToValue.classList.add('bg-color-black');
        } else {
            assignedToValue.classList.remove('bg-color-black');
        }
    });

    return assignedContacts;
}

function toggleAssignedToList() {
    let toggleAssignedToListRef = document.getElementById('assigned-to-input')
    toggleAssignedToListRef.classList.toggle('d-block');
}

function toggleRenderCategoryInput() {
    let renderCategoryInputToggle = document.getElementById('category-input-content')
    renderCategoryInputToggle.classList.toggle('d-block');
}

function toggleOverlayCreateButton() {
    let toggleOverlayRef = document.getElementById('overlay')
    toggleOverlayRef.classList.toggle('d-none');
}

function setPrioButton(prio) {
    selectedPrioButton = prio;

    document.getElementById('urgent-button').classList.remove('active', 'urgent');
    document.getElementById('medium-button').classList.remove('active', 'medium');
    document.getElementById('low-button').classList.remove('active', 'low');

    if (prio === 'urgent') {
        document.getElementById('urgent-button').classList.add('active', 'urgent');
    } else if (prio === 'medium') {
        document.getElementById('medium-button').classList.add('active', 'medium');
    } else if (prio === 'low') {
        document.getElementById('low-button').classList.add('active', 'low');
    }
}

async function addNewArrayFromInputs() {
    let assignedContacts  = getSelectedAssignedUsers();  
    
    let newTask = {
        title: document.getElementById("title-input").value,
        description: document.getElementById("description-input").value,
        assignedContacts : assignedContacts,  
        prioButton:selectedPrioButton,
        dueDate: document.getElementById("due-date-input").value,
        category: document.getElementById("category-input-placeholder").innerHTML,
        subtasks: subtasksArray,
    };

    resetInputFields()

    try {
        await postData(`/tasks`, newTask);
        console.log("Task successfully added:", newTask);
    } catch (error) {
        console.error("Error adding task:", error);
    }
}

async function postData(path = "", data = {}) {
    await fetch(FIREBASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

function resetInputFields() {
    document.getElementById("title-input").value = "";
    document.getElementById("description-input").value = "";
    document.getElementById("assigned-to-input").value = "";
    document.getElementById("assigned-to-list").value = "";
    document.getElementById("due-date-input").value = "";
    document.getElementById("category-input").innerHTML = "Select task category";
    document.getElementById("subtask-input").value = "";
    document.getElementById('urgent-button').classList.remove('active', 'urgent');
    document.getElementById('medium-button').classList.remove('active', 'medium');
    document.getElementById('low-button').classList.remove('active', 'low');

    const checkboxes = document.querySelectorAll('.assign-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.assigned-to-list-values').classList.remove('bg-color-black');
    });
}

function changeCategoryInput(selectedCategory) {
    const categoryInputPlaceholderRef = document.getElementById('category-input-placeholder');
    const renderCategoryInputToggle = document.getElementById('category-input-content');
    const placeholderText = 'Select task category';
    
    categoryInputPlaceholderRef.innerHTML = (selectedCategory === placeholderText || selectedCategory === categoryInputPlaceholderRef.innerHTML) 
        ? placeholderText 
        : selectedCategory;
    
    renderCategoryInputToggle.classList.add('d-none');
}

document.getElementById('category-input-placeholder').addEventListener('click', function() {
    changeCategoryInput('Select task category');
});

function addSubtaskToArray() {
    let subtaskInput = document.getElementById("subtask-input").value; 
    
    if (subtaskInput) { 
        subtasksArray.push(subtaskInput); 
        document.getElementById("subtask-input").value = ""; 
        renderSubtasks(); 
    }
}

function removeSubtask(index) {
    subtasksArray.splice(index, 1);
    renderSubtasks();
}

function renderSubtasks() {
    let subtasksList = document.getElementById("subtasks-list");
    subtasksList.innerHTML = ""; 

    subtasksArray.forEach((subtask, index) => {
        subtasksList.innerHTML +=  /*html*/ `
        <li class="subtask-list-items" >${subtask} 
        <img onclick="removeSubtask(${index})"src="/assets/img/add-task/subtask-bin.svg" alt="">
        </li>`;
    });
}

document.getElementById('calendar-icon').addEventListener('click', function() {
    let currentDate = new Date();

    let day = String(currentDate.getDate()).padStart(2, '0');
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let year = currentDate.getFullYear();

    let formattedDate = `${day}/${month}/${year}`;

    document.getElementById('due-date-input').value = formattedDate;
});

document.querySelector('.assigned-to-toggle-button').addEventListener('click', function() {
    let imgElement = this.querySelector('img');
    imgElement.classList.toggle('rotate');
});

function toggleRotate() {
    let img = document.getElementById('category-icon');
    img.classList.toggle('rotate');
}

function validateForm() {
    let dueDate = document.getElementById("due-date-input").value;
    let category = document.getElementById("category-input-placeholder").innerHTML;
    let title = document.getElementById("title-input").value;

    let isValid = true;

    let dueDateInput = document.getElementById("due-date-input");
    let dueDateError = document.getElementById("due-date-error");
    const dueDateTest = dueDateInput.value.trim();
    
    if (dueDate === "" || isNaN(Number(dueDateTest.replace(/\//g, "")))) {
        dueDateInput.classList.add("error");
        dueDateError.style.display = "block";
        isValid = false;
    } else {
        dueDateInput.classList.remove("error");
        dueDateError.style.display = "none";
    }

    let titleInput = document.getElementById("title-input");
    let titleError = document.getElementById("title-error");
    if (title === "") {
        titleInput.classList.add("error");
        titleError.style.display = "block";
        isValid = false;
    } else {
        titleInput.classList.remove("error");
        titleError.style.display = "none";
    }

    let categoryInput = document.getElementById("category-input");
    let categoryError = document.getElementById("category-error");
    if (category === "Select task category") {
        categoryInput.classList.add("error");
        categoryError.style.display = "block";
        isValid = false;
    } else {
        categoryInput.classList.remove("error");
        categoryError.style.display = "none";
    }

    if (isValid) {
        addNewArrayFromInputs();
        toggleOverlayCreateButton();
    } else {
        console.log("Form is not valid. Please fill in all required fields.");
    }
}
