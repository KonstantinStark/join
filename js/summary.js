async function init() {
    await loadTasks(); // Ensure tasks are loaded before rendering the count
}

async function loadTasks() {
    let tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
    let responseToJson = await tasksResponse.json();

    tasks = [];  // Initialize or reset tasks array
    let taskCount = 0;  // Initialize total task count
    let urgentTaskCount = 0;  // Initialize urgent task count

    if (responseToJson) {
        taskCount = Object.keys(responseToJson).length;  // Count the number of tasks
        Object.keys(responseToJson).forEach(key => {
            const task = {
                id: key,
                assignedContacts: responseToJson[key]['assignedContacts'],
                category: responseToJson[key]['category'],
                description: responseToJson[key]['description'],
                dueDate: responseToJson[key]['dueDate'],
                prioButton: responseToJson[key]['prioButton'],
                title: responseToJson[key]['title']
            };

            tasks.push(task);

            // Check if the task's priority is "urgent"
            if (task.prioButton === "urgent") {
                urgentTaskCount++;
            }
        });
    }

    console.log(`Total tasks: ${taskCount}`);
    console.log(`Urgent tasks: ${urgentTaskCount}`);
    console.log(tasks);

    renderTaskCount(taskCount);          // Render total task count
    renderUrgentTaskCount(urgentTaskCount);  // Render urgent task count
    renderTasks();                       // Render the tasks if needed
}

function renderTaskCount(taskCount) {
    let taskCountRef = document.getElementById('to-do-placeholder');
    taskCountRef.innerHTML = `${taskCount}`;  
}

function renderUrgentTaskCount(urgentTaskCount) {
    let urgentCountRef = document.getElementById('urgent-placeholder');
    urgentCountRef.innerHTML = `${urgentTaskCount}`;  
}

function renderUrgentDate() {
    let urgentCountRef = document.getElementById('urgent-date-placeholder');
    urgentCountRef.innerHTML = `${urgentDate}`;  
}
