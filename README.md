# OJT-2025-Persistent-Notes-Workspace-with-Search-Tags
Because they lack a central location to store, arrange, and conveniently retrieve notes, people frequently misplace or forget crucial information. By developing a persistent, searchable workspace that enables users to tag, edit, and store notes indefinitely, this project addresses that issue. 

## ✨ Features

- **User Authentication**
  - Login / Sign-up flow
  - Basic authorization checks before accessing the workspace

- **Persistent Notes**
  - Notes stored in browser LocalStorage in JSON format
  - Automatic loading of saved notes on page refresh

- **Search & Filter**
  - Search notes by text
  - Filter and sort using tags and other criteria

- **Folders & Organization**
  - Group notes into folders using the folder manager

- **Formatting & Media**
  - Basic text formatting toolbar (bold, italic, etc.)
  - Support for attaching or handling media (via `mediaManager.js`)

- **Import / Export**
  - Export notes as JSON
  - Import notes from JSON files

- **Theming**
  - Theme manager (e.g., light / dark mode support)

---

## 🛠 Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Storage:** `localStorage` (JSON-based persistence)

---

## 📁 Project Structure

├── CSS
│   ├── index.css         # Styles for main index page
│   ├── signup.css        # Styles for signup page
│   └── styles.css        # Shared/global styles
├── HTML
│   └── signup.html       # Signup / registration page
├── JS
│   ├── authButtons.js        # Handles login/logout/auth-related buttons
│   ├── authPage.js           # Authorization and access control logic
│   ├── constants.js          # Constant keys, prefixes, reusable values
│   ├── eventHandlers.js      # Centralised DOM event handlers
│   ├── exportImport.js       # Import/export notes (JSON)
│   ├── filterSearchSort.js   # Search, filter and sort functionality
│   ├── folderManager.js      # Folder / grouping logic for notes
│   ├── formattingToolbar.js  # Text formatting toolbar controls
│   ├── loginPage.js          # Login page functionality & validation
│   ├── mediaManager.js       # Media handling inside notes
│   ├── noteManager.js        # Core CRUD operations for notes
│   ├── noteOperations.js     # High-level note operations & coordination
│   ├── notesApp.js           # App entry point – wires everything together
│   ├── renderer.js           # Rendering notes and UI updates
│   ├── storage.js            # LocalStorage + JSON persistence logic
│   ├── themeManager.js       # Theme switching logic
│   └── utilities.js          # Helper / utility functions
├── index.html             # Main application entry page
└── LICENSE                # Project license