let googleUserId;
let visibilityVal = true;

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
      googleUserId = user.uid;
      getNotes(googleUserId);
    } else {
      // If not logged in, navigate back to login page.
      window.location = 'index.html';
    };
  });
};

const getNotes = (userId) => {
  const notesRef = firebase.database().ref(`users/${userId}`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    renderDataAsHtml(data);
  });
};

const renderDataAsHtml = (data) => {
  let cards = ``;
  for (const noteItem in data) {
    const note = data[noteItem];
    // For each note create an HTML card
    cards += createCard(note, noteItem, visibilityVal)
  };
  // Inject our string of HTML into our viewNotes.html page
  document.querySelector('#app').innerHTML = cards;
};

const createCard = (note, noteID, showCard) => {
    if(showCard) {
        if(note.visibility === "visible") {
            return `
                <div class="column is-one-quarter">
                <div class="card" id="noteCard">
                    <header class="card-header">
                    <p class="card-header-title">${note.title}</p>
                    </header>
                    <div class="card-content">
                    <div class="content">${note.text}</div>
                    </div>
                    <footer class="card-footer">
                        <a href="#" class="card-footer-item" onclick="editNote('${noteID}')">Edit</a>
                        <a href="#" class="card-footer-item" onclick="archiveNote('${noteID}')">Archive</a>
                        <a href="#" class="card-footer-item" onclick="deleteNote('${noteID}')">Delete</a>
                    </footer>
                </div>
                </div>
            `;
        }
        return ``;
    }
    else {
        if(note.visibility === "archived") {
            return `
                <div class="column is-one-quarter">
                <div class="card" id="noteCard">
                    <header class="card-header">
                    <p class="card-header-title">${note.title}</p>
                    </header>
                    <div class="card-content">
                    <div class="content">${note.text}</div>
                    </div>
                    <footer class="card-footer">
                        <a href="#" class="card-footer-item" onclick="editNote('${noteID}')">Edit</a>
                        <a href="#" class="card-footer-item" onclick="archiveNote('${noteID}')">Archive</a>
                        <a href="#" class="card-footer-item" onclick="deleteNote('${noteID}')">Delete</a>
                    </footer>
                </div>
                </div>
            `;
        }
        return ``;
    }
}

const seeArchived = () => {
    visibilityVal = false;
    getNotes(googleUserId);
}

const deleteNote = (noteID) => {
    if(window.confirm("Are you sure you want to delete this note?")) {
        firebase.database().ref(`/users/${googleUserId}/${noteID}`).remove();
    }
    
}

const editNote = (noteID) => {
    const editNoteModal = document.querySelector('#editNoteModal');
    const notesRef = firebase.database().ref(`users/${googleUserId}`);
    notesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const note = data[noteID];

        document.querySelector("#editTitleInput").value = note.title;
        document.querySelector("#editTextInput").value = note.text;
        document.querySelector("#editNoteID").value = noteID
    });
    editNoteModal.classList.toggle("is-active");
}

const closeEditModal = () => {
    const editNoteModal = document.querySelector('#editNoteModal');
    editNoteModal.classList.toggle("is-active");
}

const saveEditedNote = () => {
    const noteTitle = document.querySelector("#editTitleInput").value;
    const noteText = document.querySelector("#editTextInput").value;
    const noteID = document.querySelector("#editNoteID").value;

    const noteEdits = {
        title: noteTitle,
        text: noteText
    };
    firebase.database().ref(`/users/${googleUserId}/${noteID}`).update(noteEdits);

    closeEditModal();
}

const archiveNote = (noteID) => {
    firebase.database().ref(`/users/${googleUserId}/${noteID}`).update({visibiity: "archived"});
    const card = document.querySelector("#noteCard");
    card.style.display = "none";
}