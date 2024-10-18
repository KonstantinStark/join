async function init() {
    await loadUsers();
}

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
                color: responseToJson[key]['color'] 
            });
        });
    }

    console.log(users);
    populateAssignedToInput();
}

function populateAssignedToInput() {
    let assignedToInput = document.getElementById("assigned-to-input");
    assignedToInput.innerHTML = "";

    users.forEach(user => {
        assignedToInput.innerHTML += /*html*/`
        <option value="${user.id}">
            ${user.name}
        </option>
        `;
    });
}

async function addNewArrayFromInputs() {
    const newTasks = getTasksFromInput();

    for (let task of newTasks) {
        const userId = task.assignedUserId;
        try {
            await postData(`/users/${userId}/tasks`, task);
            console.log(`Task added for user ${userId}:`, task);
        } catch (error) {
            console.error(`Error adding task for user ${userId}:`, error);
        }
    }
}

function getTasksFromInput() {
    const addTask = {
        title: document.getElementById("title-input").value,
        description: document.getElementById("description-input").value,
        assignedUserId: document.getElementById("assigned-to-input").value,
        dueDate: document.getElementById("due-date-input").value,
        category: document.getElementById("category-input").value,
        subtask: document.getElementById("subtask-input").value
    };

    resetInputFields();

    console.log('see if addTask works:', addTask);
    return [addTask];
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
    document.getElementById("due-date-input").value = "";
    document.getElementById("category-input").value = "";
    document.getElementById("subtask-input").value = "";
}

console.log(loadUsers());
