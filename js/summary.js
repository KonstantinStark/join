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
    const tasksData = await fetchData('/tasks.json');
    const { taskCount, urgentTaskCount, tasks } = processTasksData(tasksData);
    renderToDoCount(tasks);
    renderUrgentTaskCount(urgentTaskCount);
    renderDoneCount(tasks);
    renderTasksOnBoard(tasks);
    renderTasksInProgress(tasks);
    renderAwaitingFeedback(tasks);
    renderLatestUrgentDate();
}

/**
 * Fetches data from the given Firebase endpoint.
 */
async function fetchData(endpoint) {
    const response = await fetch(FIREBASE_URL + endpoint);
    return await response.json();
}

/**
 * Processes the task data and counts the number of tasks and urgent tasks.
 */
function processTasksData(data) {
    let taskCount = 0, urgentTaskCount = 0, tasks = [];
    if (data) {
        Object.keys(data).forEach(key => {
            const task = mapTaskData(key, data[key]);
            tasks.push(task);
            taskCount++;
            if (task.prioButton === "urgent") urgentTaskCount++;
        });
    }
    return { taskCount, urgentTaskCount, tasks };
}

/**
 * Maps the raw task data into a task object.
 */
function mapTaskData(id, taskData) {
    return {
        id,
        assignedContacts: taskData['assignedContacts'],
        category: taskData['category'],
        description: taskData['description'],
        dueDate: taskData['dueDate'],
        prioButton: taskData['prioButton'],
        title: taskData['title'],
        boardCategory: taskData['boardCategory']
    };
}

/**
 * Renders the total task count in the DOM.
 */
function renderToDoCount(tasks) {
    const toDoCount = tasks.filter(task => task.boardCategory === "to-do").length;
    document.getElementById('toDoPlaceholder').innerHTML= `${toDoCount}`;
}


/**
 * Renders the number of urgent tasks in the DOM.
 */
function renderUrgentTaskCount(urgentTaskCount) {
    document.getElementById('urgent-placeholder').innerHTML = `${urgentTaskCount}`;
}

/**
 * Renders the number of done tasks in the DOM.
 */
async function renderDoneCount(tasks) {
    const doneCount = tasks.filter(task => task.boardCategory === "done").length;
    document.getElementById('done-placeholder').innerHTML = `${doneCount}`;
}

/**
 * Renders the number of tasks on the board in the DOM.
 */
async function renderTasksOnBoard(tasks) {
    const tasksOnBoardCount = tasks.filter(task => task.boardCategory).length;
    document.getElementById('tasks-on-board-placeholder').innerHTML = `${tasksOnBoardCount}`;
}

/**
 * Renders the number of tasks in progress in the DOM.
 */
function renderTasksInProgress(tasks) {
    const tasksInProgressCount = tasks.filter(task => task.boardCategory === "in-progress").length;
    document.getElementById('tasks-in-progres-placeholder').innerHTML = `${tasksInProgressCount}`;
}

/**
 * Renders the number of tasks awaiting feedback in the DOM.
 */
async function renderAwaitingFeedback(tasks) {
    const awaitingFeedbackCount = tasks.filter(task => task.boardCategory === "await-feedback").length;
    document.getElementById('awaiting-feedback-placeholder').innerHTML = `${awaitingFeedbackCount}`;
}

/**
 * Fetches the latest due date for urgent tasks.
 */
async function getLatestUrgentTaskDate() {
    const tasksData = await fetchData('/tasks.json');
    return findLatestUrgentTaskDate(tasksData);
}

/**
 * Finds the latest due date for urgent tasks from the provided data.
 */
function findLatestUrgentTaskDate(data) {
    let latestUrgentDate = null;
    Object.keys(data).forEach(key => {
        const task = data[key];
        if (task.prioButton === "urgent" && task.dueDate) {
            const taskDueDate = new Date(task.dueDate);
            if (!isNaN(taskDueDate.getTime()) && (!latestUrgentDate || taskDueDate > latestUrgentDate)) {
                latestUrgentDate = taskDueDate;
            }
        }
    });
    return latestUrgentDate ? latestUrgentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "No urgent tasks with a due date";
}

/**
 * Renders the latest urgent task due date in the DOM.
 */
async function renderLatestUrgentDate() {
    const urgentDate = await getLatestUrgentTaskDate();
    const urgentDatePlaceholder = document.getElementById('urgent-date-placeholder');
    urgentDatePlaceholder ? urgentDatePlaceholder.textContent = urgentDate : console.error('urgent-date-placeholder element not found');
}


/**
 * Renders the closest urgent task due date in the DOM.
 */
async function renderClosestUrgentDate() {
    const urgentDate = await getClosestUrgentTaskDate();
    const urgentDatePlaceholder = document.getElementById('urgent-date-placeholder');
    urgentDatePlaceholder ? urgentDatePlaceholder.textContent = urgentDate : console.error('urgent-date-placeholder element not found');
}

/**
 * Loads members from Firebase.
 */
async function loadMembers() {
    const membersData = await fetchData('/members.json');
    return processMembersData(membersData);
}

/**
 * Processes the member data and returns a list of member objects.
 */
function processMembersData(data) {
    return Object.keys(data).map(key => ({
        name: data[key]['name'],
        email: data[key]['email']
    }));
}

/**
 * Returns a greeting message based on the current time.
 */
function getGreeting() {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning, ";
    if (hours < 18) return "Good afternoon, ";
    if (hours < 22) return "Good evening, ";
    return "Good night, ";
}

/**
 * Renders a personalized greeting for the logged-in user in the DOM.
 */
async function renderGreeting() {
    const greetingText = document.getElementById('greeting-text');
    const nameElement = document.getElementById('name-placeholder');
    greetingText.textContent = getGreeting();
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser?.email) {
        const members = await loadMembers();
        const matchedUser = members.find(member => member.email === loggedInUser.email);
        nameElement.textContent = matchedUser?.name || "Guest";
        nameElement.style.color = matchedUser?.name ? "#29abe2" : "inherit";
    } else {
        nameElement.textContent = "Guest";
    }
}

document.addEventListener("DOMContentLoaded", renderGreeting);
