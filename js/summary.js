/**
 * Initializes the application by loading tasks.
 */
async function init() {
    await loadTasks();
}

/**
 * Loads tasks from Firebase and updates the task count and urgent task count.
 */
async function loadTasks() {
    let tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
    let responseToJson = await tasksResponse.json();
    let tasks = [];
    let taskCount = 0;
    let urgentTaskCount = 0;
    let doneCount = 0; // Initialize done count

    if (responseToJson) {
        taskCount = Object.keys(responseToJson).length;
        Object.keys(responseToJson).forEach(key => {
            const task = {
                id: key,
                assignedContacts: responseToJson[key]['assignedContacts'],
                category: responseToJson[key]['category'],
                description: responseToJson[key]['description'],
                dueDate: responseToJson[key]['dueDate'],
                prioButton: responseToJson[key]['prioButton'],
                title: responseToJson[key]['title'],
                boardCategory: responseToJson[key]['boardCategory'] // Add boardCategory to the task object
            };
            tasks.push(task);

            // Check if the task is urgent
            if (task.prioButton === "urgent") {
                urgentTaskCount++;
            }

            // Count how many tasks have the 'done' category
            if (task.boardCategory === "done") {
                doneCount++;
            }
        });
    }

    // Render counts in the DOM
    renderTaskCount(taskCount);
    renderUrgentTaskCount(urgentTaskCount);
    renderDoneCount(doneCount);  // Render the done count
}

/**
 * Renders the total task count in the DOM.
 */
function renderTaskCount(taskCount) {
    let taskCountRef = document.getElementById('toDoPlaceholder');
    taskCountRef.innerHTML = `${taskCount}`;
}

/**
 * Renders the number of urgent tasks in the DOM.
 */
function renderUrgentTaskCount(urgentTaskCount) {
    let urgentCountRef = document.getElementById('urgent-placeholder');
    urgentCountRef.innerHTML = `${urgentTaskCount}`;
}

/**
 * Renders the number of done tasks in the DOM.
 */
function renderDoneCount(doneCount) {
    let doneCountRef = document.getElementById('done-placeholder');
    doneCountRef.innerHTML = `${doneCount}`;  // Updated to render the done task count
}

/**
 * Fetches the closest due date for urgent tasks.
 */
async function getClosestUrgentTaskDate() {
    let tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
    let responseToJson = await tasksResponse.json();
    let closestUrgentDate = null;
    if (responseToJson) {
        Object.keys(responseToJson).forEach(key => {
            const task = responseToJson[key];
            if (task.prioButton === "urgent" && task.dueDate) {
                const taskDueDate = new Date(task.dueDate);
                if (!isNaN(taskDueDate.getTime())) {
                    if (!closestUrgentDate || taskDueDate < closestUrgentDate) {
                        closestUrgentDate = taskDueDate;
                    }
                }
            }
        });
    }
    return closestUrgentDate 
        ? closestUrgentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : "No urgent tasks with a due date";
}

/**
 * Renders the closest urgent task date in the DOM.
 */
async function renderClosestUrgentDate() {
    const urgentDate = await getClosestUrgentTaskDate();
    const urgentDatePlaceholder = document.getElementById('urgent-date-placeholder');
    if (urgentDatePlaceholder) {
        urgentDatePlaceholder.textContent = urgentDate;
    } else {
        console.error('urgent-date-placeholder element not found');
    }
}

renderClosestUrgentDate();

/**
 * Loads members from Firebase.
 */
async function loadMembers() {
    let membersResponse = await fetch(`${FIREBASE_URL}/members.json`);
    let responseToJson = await membersResponse.json();
    let members = [];
    if (responseToJson) {
        Object.keys(responseToJson).forEach(key => {
            const member = {
                name: responseToJson[key]['name'],
                email: responseToJson[key]['email']
            };
            members.push(member);
        });
    }
    console.log("Loaded members:", members);
    return members;
}

/**
 * Returns a greeting message based on the current time.
 */
function getGreeting() {
    const hours = new Date().getHours();
    if (hours < 12) {
        return "Good morning, ";
    } else if (hours < 18) {
        return "Good afternoon, ";
    } else if (hours < 22) {
        return "Good evening, ";
    } else {
        return "Good night, ";
    }
}

/**
 * Renders a personalized greeting for the logged-in user.
 */
async function renderGreeting() {
    const greetingText = document.getElementById('greeting-text');
    const nameElement = document.getElementById('name-placeholder');
    greetingText.textContent = getGreeting();
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && loggedInUser.email) {
        const members = await loadMembers();
        const matchedUser = members.find(member => member.email === loggedInUser.email);
        if (matchedUser && matchedUser.name) {
            nameElement.textContent = matchedUser.name;
            nameElement.style.color = "#29abe2";
        } else {
            nameElement.textContent = "Guest";
        }
    } else {
        nameElement.textContent = "Guest";
    }
}

document.addEventListener("DOMContentLoaded", renderGreeting);
