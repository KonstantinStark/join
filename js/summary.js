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
    let taskCountRef = document.getElementById('toDoPlaceholder');
    taskCountRef.innerHTML = `${taskCount}`;  
}

function renderUrgentTaskCount(urgentTaskCount) {
    let urgentCountRef = document.getElementById('urgent-placeholder');
    urgentCountRef.innerHTML = `${urgentTaskCount}`;  
}

function renderUrgentDate() {
    let urgentCountRef = document.getElementById('urgent-date-placeholder');
    urgentCountRef.innerHTML = `${dueDate}`;  
}

async function getClosestUrgentTaskDate() {
    let tasksResponse = await fetch(FIREBASE_URL + '/tasks.json');
    let responseToJson = await tasksResponse.json();

    let closestUrgentDate = null;

    if (responseToJson) {
        Object.keys(responseToJson).forEach(key => {
            const task = responseToJson[key];

            // Check if the task is "urgent" and has a valid dueDate
            if (task.prioButton === "urgent" && task.dueDate) {
                const taskDueDate = new Date(task.dueDate);

                // Only update if taskDueDate is valid
                if (!isNaN(taskDueDate.getTime())) {
                    if (!closestUrgentDate || taskDueDate < closestUrgentDate) {
                        closestUrgentDate = taskDueDate;
                    }
                }
            }
        });
    }

    // Format the date if found; otherwise, return a default message
    return closestUrgentDate 
        ? closestUrgentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : "No urgent tasks with a due date";
}

async function renderClosestUrgentDate() {
    const urgentDate = await getClosestUrgentTaskDate();
    const urgentDatePlaceholder = document.getElementById('urgent-date-placeholder');
    
    // Set the placeholder text
    if (urgentDatePlaceholder) {
        urgentDatePlaceholder.textContent = urgentDate;
    } else {
        console.error('urgent-date-placeholder element not found');
    }
}

// Call this function when loading tasks or initializing the page
renderClosestUrgentDate();


// Function to load members from Firebase
async function loadMembers() {
    let membersResponse = await fetch(`${FIREBASE_URL}/members.json`);
    let responseToJson = await membersResponse.json();

    let members = [];  // Initialize or reset members array

    if (responseToJson) {
        Object.keys(responseToJson).forEach(key => {
            const member = {
                name: responseToJson[key]['name'], // Extract 'name'
                email: responseToJson[key]['email'] // Assuming we need 'email' too
            };

            members.push(member); // Add each member object to the members array
        });
    }

    console.log("Loaded members:", members);
    return members; // Return the array of members
}

// Function to get an appropriate greeting based on the current time
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

// Function to render greeting and member name
async function renderGreeting() {
    const greetingText = document.getElementById('greeting-text');
    const nameElement = document.getElementById('name-placeholder');

    // Set the greeting based on time
    greetingText.textContent = getGreeting(); 

    // Fetch the logged-in user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser && loggedInUser.email) {
        // Load members and find the one with the matching email
        const members = await loadMembers();
        const matchedUser = members.find(member => member.email === loggedInUser.email);

        if (matchedUser && matchedUser.name) {
            // Set the user's name with the correct color
            nameElement.textContent = matchedUser.name;
            nameElement.style.color = "#29abe2";
        } else {
            // Default to "Guest" if no match is found
            nameElement.textContent = "Guest";
        }
    } else {
        // If no user is logged in, display "Guest"
        nameElement.textContent = "Guest";
    }
}

// Call renderGreeting on page load
document.addEventListener("DOMContentLoaded", renderGreeting);
