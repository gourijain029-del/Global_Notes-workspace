import { getTagColor, escapeHtml, formatDate } from "./utilities.js";
import { applyFilterSearchAndSort } from "./filterSearchSort.js";
//import { getFolders } from "./folderManager.js";

const $ = (selector) => document.querySelector(selector);
const $all = (selector) => Array.from(document.querySelectorAll(selector));

// Renders the list of notes in the sidebar, filtered by folder and search criteria
export function renderNotesList(notes, activeNoteId, setActiveNote, activeFolderId) {
  const listEl = $("#notes-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  // Filter notes by folder
  // - When a specific folder is selected, show only notes in that folder
  // - When "All Notes" is selected (activeFolderId === null), show only notes not in any folder
  let notesToDisplay = notes;
  if (activeFolderId === null) {
    notesToDisplay = notes.filter((note) => !note.folderId);
  } else if (activeFolderId !== undefined) {
    notesToDisplay = notes.filter((note) => note.folderId === activeFolderId);
  }

  const visibleNotes = applyFilterSearchAndSort(notesToDisplay);
  if (!visibleNotes.length) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "note-item";
    emptyLi.innerHTML =
      '<div class="note-card"><p class="note-preview">No notes match your search or filters. Click "New note" to start or clear filters.</p></div>';
    listEl.appendChild(emptyLi);
    return;
  }

  visibleNotes.forEach((note) => {
    const li = document.createElement("li");
    li.className = "note-item" + (note.id === activeNoteId ? " active" : "");
    li.dataset.id = note.id;
    li.dataset.tags = (note.tags || []).join(", ");//check this

    const btn = document.createElement("button");
    btn.className = "note-card";

    // Apply theme to note card
    if (note.theme) {
      btn.setAttribute("data-theme", note.theme);
    }


    const plainContent = (note.content || "").replace(/<[^>]*>/g, "");
    const previewText =
      plainContent && plainContent.trim().length > 0
        ? plainContent.trim().slice(0, 120) + (plainContent.trim().length > 120 ? "…" : "")
        : "Empty note";

    const safeTitle = escapeHtml(note.title || "Untitled note");
    const safeDatetime = escapeHtml(note.updatedAt || "");
    const friendlyDate = escapeHtml(formatDate(note.updatedAt));
    const safePreview = escapeHtml(previewText);

    const tagsHtml = (note.tags || [])
      .map(
        (t) =>
          `<span class="tag" style="--tag-color:${getTagColor(t)}">${escapeHtml(t)}</span>`
      )
      .join("");

    btn.innerHTML = `
      <div class="note-meta">
        <h3 class="note-title">${safeTitle}</h3>
        <time class="note-time" datetime="${safeDatetime}">
          ${friendlyDate}
        </time>
      </div>
      <p class="note-preview">${safePreview}</p>
      <div class="tag-row">${tagsHtml}</div>
    `;

    btn.addEventListener("click", () => {
      setActiveNote(note.id);
    });

    li.appendChild(btn);
    listEl.appendChild(li);
  });
}

// Displays the currently selected note in the main editor area
export function renderActiveNote(note, removeTagFromActiveNote) {
  const titleInput = $("#title");
  const contentInput = $("#content");
  const tagsContainer = $("#tags");
  const editorSection = $(".editor");

  if (!note) {
    if (titleInput) titleInput.value = "";
    if (contentInput) {
      contentInput.innerHTML = "";
      contentInput.removeAttribute("data-pattern");
    }
    if (tagsContainer) tagsContainer.innerHTML = "";
    if (editorSection) editorSection.removeAttribute("data-theme");
    return;
  }

  if (titleInput) titleInput.value = note.title || "";
  if (contentInput) {
    contentInput.innerHTML = note.content || "";
    // Apply editor pattern
    contentInput.setAttribute("data-pattern", note.editorPattern || "plain");
  }

  // Apply editor theme
  if (editorSection) {
    if (note.theme) {
      editorSection.setAttribute("data-theme", note.theme);
    } else {
      editorSection.removeAttribute("data-theme");
    }
  }

  if (tagsContainer) {
    tagsContainer.innerHTML = "";
    (note.tags || []).forEach((tag) => {
      const chip = document.createElement("button");
      chip.className = "chip small tag-chip";
      chip.textContent = tag;
      chip.type = "button";
      chip.style.setProperty("--tag-color", getTagColor(tag));
      chip.addEventListener("click", () => removeTagFromActiveNote(tag));
      tagsContainer.appendChild(chip);
    });
  }//check this

  $all(".notes-list .note-item").forEach((li) => {
    li.classList.toggle("active", li.dataset.id === note.id);
  });
}

// Updates the UI to show/hide user information and auth buttons
export function updateUserDisplay(activeUser) {
  const pill = $("#user-pill");
  const nameEl = $("#user-name");
  const loginBtn = $("#login");


  if (!pill || !nameEl) return;

  if (activeUser) {
    pill.classList.remove("hidden");
    nameEl.textContent = `@${activeUser}`;
    loginBtn?.classList.add("hidden");
  } else {
    pill.classList.add("hidden");
    nameEl.textContent = "";
    loginBtn?.classList.remove("hidden");
  }
}

/**
 * Render folder list in sidebar
 * @param {Array} folders - All folders
 * @param {string} activeFolderId - Currently selected folder ID
 * @param {Function} setActiveFolder - Callback to set active folder
 */
// Renders the folders list in the sidebar with the currently active folder highlighted
const FOLDER_ICON = `<svg class="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
const ALL_NOTES_ICON = `<svg class="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

export function renderFolders(folders, activeFolderId, setActiveFolder) {
  const foldersEl = $("#folders-list");
  if (!foldersEl) return;
  foldersEl.innerHTML = "";

  // Helper to create row
  const createFolderRow = (id, name, iconHtml, count, isCustom = false) => {
    const li = document.createElement("li");
    li.className = "folder-item" + (id === activeFolderId ? " active" : "");
    if (isCustom) {
      li.dataset.dragId = id;
      li.dataset.id = id; // Required for eventHandlers.js delegation only
    }

    const row = document.createElement("div");
    row.className = "folder-row";
    row.addEventListener("click", () => setActiveFolder(id));

    // Name & Icon
    const btn = document.createElement("div");
    btn.className = "folder-btn";
    btn.innerHTML = `${iconHtml} <span>${escapeHtml(name)}</span>`;

    // Actions & Badge
    const actions = document.createElement("div");
    actions.className = "folder-actions";

    if (isCustom) {
      // Rename
      const renameBtn = document.createElement("button");
      renameBtn.className = "folder-action-btn folder-rename-btn"; // Add functional class
      renameBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
      renameBtn.title = "Rename";
      // Removed placeholder onclick so event bubbles to folder-list listener

      // Delete
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "folder-action-btn folder-delete-btn"; // Add functional class
      deleteBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
      deleteBtn.title = "Delete";
      // Removed placeholder onclick

      actions.appendChild(renameBtn);
      actions.appendChild(deleteBtn);
    }

    row.appendChild(btn);
    // row.appendChild(badge);
    row.appendChild(actions);
    li.appendChild(row);
    return li;
  };

  // 1. All Notes - Removed (Now in Library Section)
  // foldersEl.appendChild(createFolderRow(null, "All Notes", ALL_NOTES_ICON, 0, false));

  // 2. Custom Folders
  folders.forEach((folder) => {
    foldersEl.appendChild(createFolderRow(folder.id, folder.name, FOLDER_ICON, 0, true));
  });

  // Re-attach drag listeners if needed (handled in layoutManager or similar)
}

/**
 * Updates the visual active state of the sidebar (Library vs Folders)
 * @param {string|null} activeFolderId - The currently active folder ID (or null)
 * @param {string|null} activeLibraryId - The ID of the active library item (e.g., 'nav-all-notes', 'nav-recent')
 */
export function updateSidebarSelection(activeFolderId, activeLibraryId) {
  // 1. Handle Library Items
  const libraryItems = document.querySelectorAll('.library-item');
  libraryItems.forEach(item => {
    if (activeLibraryId && item.id === activeLibraryId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 2. Handle Folders
  const folderItems = document.querySelectorAll('.folder-item');
  folderItems.forEach(item => {
    // If we have a folder ID, highlight it. 
    // If activeLibraryId is set, folders should NOT be highlighted (even if logic technically permits).
    if (activeFolderId && !activeLibraryId && item.dataset.dragId === activeFolderId) { // Check dragId as we used it for ID
      // Note: In renderFolders we used dataset.dragId for custom folders.
      // Let's rely on the fact renderFolders handles its own active state class assignment during render,
      // BUT we might need to clear it if a Library item is clicked without re-rendering?
      // Actually, renderFolders rerenders the list. So we just need to make sure we don't accidentally keep one active.
      // Use logic: If activeLibraryId is present, ensure no folder is active.
      // Wait, renderFolders takes activeFolderId. If we pass null, it highlights nothing.
      // So we just need to handle the Library side.
    }
  });

  // Actually, standardizing:
  // If activeLibraryId is passed, we highlight that.
  // We assume renderFolders is called separately with the correct ID.
}
