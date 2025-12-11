const $ = (selector) => document.querySelector(selector);

// Inserts HTML content at the current cursor position in the content editable area
export function insertHtmlAtCursor(html) {
  const contentEl = $("#content");
  if (!contentEl) return;

  contentEl.focus();
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    contentEl.insertAdjacentHTML("beforeend", html);
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();
  const fragment = range.createContextualFragment(html);
  range.insertNode(fragment);
}

// Sets up all formatting toolbar buttons and their corresponding actions
export function wireFormattingToolbar() {
  const contentEl = $("#content");
  if (!contentEl) return;

  // Applies the specified formatting or edit command to the selected text
  function applyFormat(command) {
    contentEl.focus();
    try {
      document.execCommand(command, false, null);
    } catch (e) {
      console.error("Command failed", command, e);
    }
  }

  // Format dropdown (Bold, Italic, Underline, Bullet List)
  const formatSelect = $("#format-action");
  if (formatSelect) {
    formatSelect.addEventListener("change", (e) => {
      const action = e.target.value;
      if (!action) return;

      switch (action) {
        case "bold":
          applyFormat("bold");
          break;
        case "italic":
          applyFormat("italic");
          break;
        case "underline":
          applyFormat("underline");
          break;
        case "strikethrough":
          applyFormat("strikeThrough");
          break;
        case "alignLeft":
          applyFormat("justifyLeft");
          break;
        case "alignCenter":
          applyFormat("justifyCenter");
          break;
        case "alignRight":
          applyFormat("justifyRight");
          break;
        case "bullet":
          applyFormat("insertUnorderedList");
          break;
      }

      // Reset dropdown to default
      setTimeout(() => {
        e.target.value = "";
      }, 100);
    });
  }

  // Edit dropdown (Cut, Copy, Paste)
  const editSelect = $("#edit-action");
  if (editSelect) {
    editSelect.addEventListener("change", (e) => {
      const action = e.target.value;
      if (!action) return;

      switch (action) {
        case "cut":
          applyFormat("cut");
          break;
        case "copy":
          applyFormat("copy");
          break;
        case "paste":
          applyFormat("paste");
          break;
      }

      // Reset dropdown to default
      setTimeout(() => {
        e.target.value = "";
      }, 100);
    });
  }


  // Print current note (only the note content)
  $("#print-note")?.addEventListener("click", () => {
    const titleInput = document.querySelector("#title");
    const contentElRef = document.querySelector("#content");
    const title = titleInput && "value" in titleInput ? titleInput.value : "Untitled note";
    const contentHtml = contentElRef ? contentElRef.innerHTML : "";

    // Basic HTML escaping for title
    const safeTitle = String(title).replace(/[&<>]/g, (ch) => {
      switch (ch) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        default: return ch;
      }
    });

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 32px; line-height: 1.6; }
    h1 { font-size: 24px; margin-bottom: 16px; }
    .content { font-size: 15px; }
  </style>
</head>
<body>
  <h1>${safeTitle}</h1>
  <div class="content">${contentHtml}</div>
</body>
</html>`);
    printWindow.document.close();

    // Give the new window a moment to render, then print
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  });

  // Text size control with proper event handling
  const textSizeSelect = $("#text-size");
  if (textSizeSelect) {
    try {
      // Load saved size preference from localStorage
      const savedSize = localStorage.getItem("notesWorkspace.textSize") || "15";
      // Set the select dropdown to the saved value
      textSizeSelect.value = savedSize;
      // Apply the saved font size to content area
      if (contentEl) {
        contentEl.style.fontSize = `${savedSize}px`;
      }
    } catch {
      // Default to 15px if localStorage fails
      if (contentEl) {
        contentEl.style.fontSize = "15px";
      }
    }

    // Listen for changes to text size dropdown
    textSizeSelect.addEventListener("change", (e) => {
      const size = e.target.value;
      console.log("Text size changed to:", size);

      // Apply new font size to content area
      if (contentEl) {
        contentEl.style.fontSize = `${size}px`;
        // Force browser to recogn ize the change
        contentEl.offsetHeight;
      }

      try {
        // Persist the user's choice to localStorage
        localStorage.setItem("notesWorkspace.textSize", size);
      } catch (err) {
        console.warn("Failed to save text size preference:", err);
      }
    });

    console.log("Text size control initialized");
  } else {
    console.warn("Text size select element not found");
  }


  // Text color control
  const textColorSelect = $("#text-color");
  if (textColorSelect) {
    textColorSelect.addEventListener("change", (e) => {
      const color = e.target.value;
      contentEl.focus();
      if (color) {
        try {
          document.execCommand("foreColor", false, color);
        } catch (err) {
          console.error("Color command failed", err);
        }
      } else {
        try {
          document.execCommand("removeFormat", false, null);
        } catch (err) {
          console.error("Remove format failed", err);
        }
      }
      // Reset dropdown to default after applying
      setTimeout(() => {
        textColorSelect.value = "";
      }, 100);
    });
  }
}