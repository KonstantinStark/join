
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


async function postData(path = "", data = {}) {
    await fetch(FIREBASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

// foreach nochmal gucken

// function populateAssignedToInput() {
//     let assignedToInput = document.getElementById("assigned-to-input");
//     assignedToInput.innerHTML = "";

//     users.forEach(user => {
//         assignedToInput.innerHTML += /*html*/`
//         <option value="${user.id}">
//             ${user.name}
//         </option>
//         `;
//     });
// }

function populateAssignedToInput() {
    let assignedToInput = document.getElementById("assigned-to-input");
    assignedToInput.innerHTML = "";

    for (let i = 0; i < users.length; i++) {
        let user = users[i];

        
        assignedToInput.innerHTML += /*html*/`
            <div class="assigned-to-list">
                <div class="assigned-to-list-values">
                <div class="assigned-to-list-values-image-name">
                    <p> 
                        <svg width="50" height="50">
                        <circle id="circle" cx="25" cy="25" r="20" fill="${user.color}" />
                        </svg>
                    </p>
                    <p>${user.name}</p>
                </div>

                 
                 <input type="checkbox" class="assign-checkbox" value="${user.id}">
                </div>
            </div>
        `;
    }
}


async function addNewArrayFromInputs() {
    const newTasks = getTasksFromInput(); 

    for (let task of newTasks) {
        try {
            await postData(`/tasks`, task);
            console.log(`Task added:`, task);
        } catch (error) {
            console.error(`Error adding task:`, error);
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



function resetInputFields() {
    document.getElementById("title-input").value = "";
    document.getElementById("description-input").value = "";
    document.getElementById("assigned-to-input").value = "";
    document.getElementById("due-date-input").value = "";
    document.getElementById("category-input").value = "";
    document.getElementById("subtask-input").value = "";
}

console.log(loadUsers());
