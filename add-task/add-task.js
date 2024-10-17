
// Load users from the database when the page loads and populate the assigned-to-input
async function init() {
    await loadUsers();  // Load users into the assigned-to-input field
}

// Function to load users from Firebase and populate the dropdown
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

    populateAssignedToInput();
}

// Populate the "assigned-to" input with the list of users
function populateAssignedToInput() {
    let assignedToInput = document.getElementById("assigned-to-input");
    assignedToInput.innerHTML = ""; // Clear any existing options

    users.forEach(user => {
        assignedToInput.innerHTML += `<option value="${user.id}">${user.name} ${user.color}</option>`;
    });
}

// Add multiple tasks to the database
async function addNewArrayFromInputs() {
    let newTasks = getTasksFromInput();
    
    // Loop through the tasks and send each to the database
    for (let task of newTasks) {
        await postData("/tasks", task);
    }

    await loadTasks();  // Optionally load tasks after adding them
}

// Get task input and return an array of tasks
function getTasksFromInput() {
    // Create a task object based on the input fields
    let addTask = {
        title: document.getElementById("title-input").value,
        description: document.getElementById("description-input").value,
        assignedUserId: document.getElementById("assigned-to-input").value, // Selected user ID
        dueDate: document.getElementById("due-date-input").value,
        category: document.getElementById("category-input").value,
        subtask: document.getElementById("subtask-input").value
    };

    // Add the task object to an array (in case there are multiple tasks to add)
    return [addTask];  // For now, it's just one task, but you can add multiple if needed
}

// Function to send data to Firebase
async function postData(path = "", data = {}) {
    await fetch(FIREBASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

// Function to load tasks (optional if needed)
async function loadTasks() {
    // Your code to load tasks from Firebase and display them
}
