import { getNotes, setNotes, getActiveUser, clearActiveUser } from "./storage.js";

let notes = [];
let activeNoteId = null;
let activeUser = null;

const $ = (selector) => document.querySelector(selector);
const $all = (selector) => Array.from(document.querySelectorAll(selector));

function createNote(partial = {}) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    title: partial.title || "",
    content: partial.content || "",
    tags: Array.isArray(partial.tags) ? partial.tags : [],
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now,
  };
}

function persistNotes() {
  setNotes(activeUser, notes);
}

function ensureAtLeastOneNote() {
  if (!notes.length) {
    const initial = createNote({
      title: "Welcome to Notes Workspace",
      content:
        "This is your first note. Use the sidebar to switch notes, add tags above, and search from the top bar.\n\nYour notes are saved locally in this browser.",
      tags: ["ideas"],
    });
    notes.push(initial);
    activeNoteId = initial.id;
    persistNotes();
  } else if (!activeNoteId) {
    activeNoteId = notes[0].id;
  }
}

function loadNotesForCurrentUser() {
  notes = getNotes(activeUser);
  ensureAtLeastOneNote();
}

function updateUserDisplay() {
  const pill = $("#user-pill");
  const nameEl = $("#user-name");
  const loginBtn = $("#login");
  const signupBtn = $("#signup");

  if (!pill || !nameEl) return;

  if (activeUser) {
    pill.classList.remove("hidden");
    nameEl.textContent = `@${activeUser}`;
    loginBtn?.classList.add("hidden");
    signupBtn?.classList.add("hidden");
  } else {
    pill.classList.add("hidden");
    nameEl.textContent = "";
    loginBtn?.classList.remove("hidden");
    signupBtn?.classList.remove("hidden");
  }
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getActiveFilter() {
  const activeChip = document.querySelector(".filters .chip.active");
  return activeChip ? activeChip.dataset.filter || "all" : "all";
}

function getSearchQuery() {
  const input = $("#search");
  return input ? input.value.trim().toLowerCase() : "";
}

function getSortMode() {
  const select = $("#sort");
  return select ? select.value : "updated_desc";
}

function applyFilterSearchAndSort(baseNotes) {
  const filter = getActiveFilter();
  const query = getSearchQuery();
  const sortMode = getSortMode();

  let result = [...baseNotes];

  if (filter && filter !== "all") {
    result = result.filter((note) => note.tags && note.tags.includes(filter));
  }

  if (query) {
    result = result.filter((note) => {
      const haystack = [note.title || "", note.content || "", (note.tags || []).join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  result.sort((a, b) => {
    switch (sortMode) {
      case "updated_asc":
        return (a.updatedAt || "").localeCompare(b.updatedAt || "");
      case "title_asc":
        return (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" });
      case "title_desc":
        return (b.title || "").localeCompare(a.title || "", undefined, { sensitivity: "base" });
      case "updated_desc":
      default:
        return (b.updatedAt || "").localeCompare(a.updatedAt || "");
    }
  });

  return result;
}

function renderNotesList() {
  const listEl = $("#notes-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  const visibleNotes = applyFilterSearchAndSort(notes);
  if (!visibleNotes.length) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "note-item";
    emptyLi.innerHTML =
      '<div class="note-card"><p class="note-preview">No notes yet. Click “New note” to start.</p></div>';
    listEl.appendChild(emptyLi);
    return;
  }

  visibleNotes.forEach((note) => {
    const li = document.createElement("li");
    li.className = "note-item" + (note.id === activeNoteId ? " active" : "");
    li.dataset.id = note.id;
    li.dataset.tags = (note.tags || []).join(", ");

    const btn = document.createElement("button");
    btn.className = "note-card";

    const previewText =
      note.content && note.content.trim().length > 0
        ? note.content.trim().slice(0, 120) + (note.content.trim().length > 120 ? "…" : "")
        : "Empty note";

    btn.innerHTML = `
      <div class="note-meta">
        <h3 class="note-title">${note.title || "Untitled note"}</h3>
        <time class="note-time" datetime="${note.updatedAt || ""}">
          ${formatDate(note.updatedAt)}
        </time>
      </div>
      <p class="note-preview">${previewText}</p>
      <div class="tag-row">
        ${(note.tags || [])
          .map((t) => `<span class="tag">${t}</span>`)
          .join("")}
      </div>
    `;

    btn.addEventListener("click", () => {
      setActiveNote(note.id);
    });

    li.appendChild(btn);
    listEl.appendChild(li);
  });
}

function renderActiveNote() {
  const note = notes.find((n) => n.id === activeNoteId);
  const titleInput = $("#title");
  const contentInput = $("#content");
  const tagsContainer = $("#tags");

  if (!note) {
    if (titleInput) titleInput.value = "";
    if (contentInput) contentInput.value = "";
    if (tagsContainer) tagsContainer.innerHTML = "";
    return;
  }

  if (titleInput) titleInput.value = note.title || "";
  if (contentInput) contentInput.value = note.content || "";

  if (tagsContainer) {
    tagsContainer.innerHTML = "";
    (note.tags || []).forEach((tag) => {
      const chip = document.createElement("button");
      chip.className = "chip small";
      chip.textContent = tag;
      chip.type = "button";
      chip.addEventListener("click", () => removeTagFromActiveNote(tag));
      tagsContainer.appendChild(chip);
    });
  }

  $all(".notes-list .note-item").forEach((li) => {
    li.classList.toggle("active", li.dataset.id === activeNoteId);
  });
}

function setActiveNote(noteId) {
  activeNoteId = noteId;
  renderNotesList();
  renderActiveNote();
}

function readTagsFromUI() {
  const tagsContainer = $("#tags");
  if (!tagsContainer) return [];
  return Array.from(tagsContainer.querySelectorAll(".chip.small")).map((el) => el.textContent.trim());
}

function addTagToActiveNote(tag) {
  const trimmed = tag.trim();
  if (!trimmed) return;
  const note = notes.find((n) => n.id === activeNoteId);
  if (!note) return;
  note.tags = note.tags || [];
  if (!note.tags.includes(trimmed)) {
    note.tags.push(trimmed);
    note.updatedAt = new Date().toISOString();
    persistNotes();
    renderActiveNote();
    renderNotesList();
  }
}

function removeTagFromActiveNote(tag) {
  const note = notes.find((n) => n.id === activeNoteId);
  if (!note || !note.tags) return;
  note.tags = note.tags.filter((t) => t !== tag);
  note.updatedAt = new Date().toISOString();
  persistNotes();
  renderActiveNote();
  renderNotesList();
}

function handleSaveNote() {
  const note = notes.find((n) => n.id === activeNoteId);
  if (!note) return;
  const titleInput = $("#title");
  const contentInput = $("#content");
  note.title = titleInput ? titleInput.value.trim() : "";
  note.content = contentInput ? contentInput.value : "";
  note.tags = readTagsFromUI();
  note.updatedAt = new Date().toISOString();
  persistNotes();
  renderNotesList();
}

function handleNewNote() {
  const newNote = createNote();
  notes.unshift(newNote);
  activeNoteId = newNote.id;
  persistNotes();
  renderNotesList();
  renderActiveNote();
}

function handleDeleteNote() {
  if (!activeNoteId) return;
  if (notes.length === 1) {
    const only = notes[0];
    only.title = "";
    only.content = "";
    only.tags = [];
    only.updatedAt = new Date().toISOString();
    persistNotes();
    renderActiveNote();
    renderNotesList();
    return;
  }
  notes = notes.filter((n) => n.id !== activeNoteId);
  activeNoteId = notes[0] ? notes[0].id : null;
  persistNotes();
  renderNotesList();
  renderActiveNote();
}

function handleDuplicateNote() {
  const note = notes.find((n) => n.id === activeNoteId);
  if (!note) return;
  const copy = createNote({
    title: note.title ? `${note.title} (Copy)` : "Untitled note (Copy)",
    content: note.content,
    tags: [...(note.tags || [])],
  });
  notes.unshift(copy);
  activeNoteId = copy.id;
  persistNotes();
  renderNotesList();
  renderActiveNote();
}

function wireFiltersAndSearch() {
  $all(".filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $all(".filters .chip").forEach((c) => {
        const isTarget = c === chip;
        c.classList.toggle("active", isTarget);
        c.setAttribute("aria-pressed", String(isTarget));
      });
      renderNotesList();
    });
  });

  const searchInput = $("#search");
  searchInput?.addEventListener("input", () => renderNotesList());
}

function wireSort() {
  const select = $("#sort");
  select?.addEventListener("change", () => renderNotesList());
}

function wireTagInput() {
  const addTagInput = $("#add-tag");
  if (!addTagInput) return;
  addTagInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = addTagInput.value.replace(",", "").trim();
      if (value) addTagToActiveNote(value);
      addTagInput.value = "";
    }
  });
}

function wireCrudButtons() {
  $("#new-note")?.addEventListener("click", handleNewNote);
  $("#save-note")?.addEventListener("click", handleSaveNote);
  $("#delete-note")?.addEventListener("click", handleDeleteNote);
  $("#duplicate-note")?.addEventListener("click", handleDuplicateNote);
}

function wireAuthButtons() {
  $("#login")?.addEventListener("click", () => {
    window.location.href = "./signup.html";
  });
  $("#signup")?.addEventListener("click", () => {
    window.location.href = "./signup.html";
  });
  $("#logout")?.addEventListener("click", () => {
    persistNotes();
    clearActiveUser();
    activeUser = null;
    loadNotesForCurrentUser();
    updateUserDisplay();
    renderNotesList();
    renderActiveNote();
    window.location.href = "./signup.html";
  });
}

function exportNotes() {
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "notes-backup.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importNotesFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) {
        alert("Import failed: expected an array of notes.");
        return;
      }
      notes = parsed.map((n) =>
        createNote({
          ...n,
          id: n.id || undefined,
        })
      );
      activeNoteId = notes[0] ? notes[0].id : null;
      persistNotes();
      renderNotesList();
      renderActiveNote();
    } catch (err) {
      console.error("Import failed", err);
      alert("Import failed: invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

function wireImportExport() {
  $("#export")?.addEventListener("click", exportNotes);

  const fileInput = $("#importFile");
  const importBtn = $("#import");
  if (importBtn && fileInput) {
    importBtn.addEventListener("click", () => {
      fileInput.value = "";
      fileInput.click();
    });
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (file) importNotesFromFile(file);
    });
  }
}

function initApp() {
  activeUser = getActiveUser();
  loadNotesForCurrentUser();
  wireFiltersAndSearch();
  wireSort();
  wireTagInput();
  wireCrudButtons();
  wireAuthButtons();
  wireImportExport();
  updateUserDisplay();
  renderNotesList();
  renderActiveNote();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}


