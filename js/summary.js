/**
 * Initializes the application by loading tasks.
 */
async function init() {
    await loadTasks();
}

/**
* Loads tasks from the Firebase database, processes the task data,
* and renders the task counts.
*/
async function loadTasks() {
    let tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
    let responseToJson = await tasksResponse.json();
    tasks = [];
    let taskCount = 0;
    let urgentTaskCount = 0;
    if (responseToJson) {
        ({ taskCount, urgentTaskCount } = processTasks(responseToJson));
    }
    renderTaskCount(taskCount);
    renderUrgentTaskCount(urgentTaskCount);
}

/**
 * Processes the task data from the Firebase response, counts the total number of tasks,
 * and counts how many of those tasks are marked as "urgent".
 */
function processTasks(responseToJson) {
    let taskCount = Object.keys(responseToJson).length;
    let urgentTaskCount = 0;
    Object.keys(responseToJson).forEach(key => {
        const task = createTaskObject(key, responseToJson[key]);
        tasks.push(task);
        if (task.prioButton === "urgent") {
            urgentTaskCount++;
        }
    });
    return { taskCount, urgentTaskCount };
}

/**
 * Creates a task object from the given task data.
 */
function createTaskObject(key, taskData) {
    return {
        id: key,
        assignedContacts: taskData['assignedContacts'],
        category: taskData['category'],
        description: taskData['description'],
        dueDate: taskData['dueDate'],
        prioButton: taskData['prioButton'],
        title: taskData['title']
    };
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
 * Fetches the closest due date for urgent tasks.
 */
async function getClosestUrgentTaskDate() {
    let tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
    let responseToJson = await tasksResponse.json();
    let closestUrgentDate = Object.values(responseToJson || {})
        .filter(task => task.prioButton === "urgent" && task.dueDate)
        .map(task => new Date(task.dueDate))
        .filter(date => !isNaN(date.getTime()))
        .reduce((closest, date) => !closest || date < closest ? date : closest, null);
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
        nameElement.textContent = matchedUser && matchedUser.name ? matchedUser.name : "Guest";
        nameElement.style.color = matchedUser && matchedUser.name ? "#29abe2" : "";
    } else {
        nameElement.textContent = "Guest";
    }
}

document.addEventListener("DOMContentLoaded", renderGreeting);
