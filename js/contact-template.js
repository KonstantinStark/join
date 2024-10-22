function createContactCard(person, index, initials) {
    return`
    <div onclick="editContact(${index})" class="content-container load-data-container" id="content-container-${index}"> 
        <br>
        <svg width="100" height="100">
            <circle id="circle-${index}" cx="50" cy="50" r="40" fill="${person.color}" />
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24">${initials}</text>
        </svg>
        <div class="name-email-contact-list-wrapper">
            <p>${person.name}</p>
            <p class="mail-color">${person.email}</p>
        </div>
    </div>`
}

function createEditContactTemplate(person, index, initials) {
    return `
   <div id="contact-${index}">
        <div class="svg-name-wrapper">
            <svg width="100" height="100">
                <circle id="circle-${index}" cx="50" cy="50" r="40" fill="${person.color}" />
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24">${initials}</text>
            </svg>
            <div class="name-delete-edit-wrapper">
                <h1>${person.name}</h1>
                <div class="delete-edit-contact-wrapper">
                    <span>
                        <p class="edit-btn" onclick="openEditOverlay(${index})"> <img class="contacts-icon" src="./assets/img/edit.svg"> Edit</p>
                    </span>
                    <span>
                        <p class="edit-btn" onclick="deleteContact(${index})"> <img class="contacts-icon" src="./assets/img/delete.svg"> Delete</p>
                    </span>
                </div>
            </div>
        </div> <br>
        <p>Contact Information</p> <br>
        <div>
            <p><strong>Email: <br> <p class="mail-color"></strong>${person.email}</p> </p> <br>
            <p><strong>Phone: <br> </strong>${person.phone}</p> <br>
        </div>
    </div>`;
}