export function wireSidebarToggle() {
    const toggleBtn = document.querySelector("#sidebar-toggle");
    const layout = document.querySelector(".layout");

    if (!toggleBtn || !layout) return;

    // Check for saved preference
    const isHidden = localStorage.getItem("notesWorkspace.sidebarHidden") === "true";
    if (isHidden) {
        layout.classList.add("sidebar-hidden");
    }

    toggleBtn.addEventListener("click", () => {
        layout.classList.toggle("sidebar-hidden");

        // Save preference
        const isNowHidden = layout.classList.contains("sidebar-hidden");
        localStorage.setItem("notesWorkspace.sidebarHidden", isNowHidden);
    });
}

// Handles toggling the visibility of the formatting toolbar
export function wireToolbarToggle() {
    const toggleBtn = document.querySelector("#toolbar-toggle");
    const toolbar = document.querySelector(".editor-toolbar");

    if (!toggleBtn || !toolbar) return;

    // Check for saved preference
    const isCollapsed = localStorage.getItem("notesWorkspace.toolbarCollapsed") === "true";
    if (isCollapsed) {
        toolbar.classList.add("collapsed");
    }

    toggleBtn.addEventListener("click", () => {
        toolbar.classList.toggle("collapsed");

        // Save preference
        const isNowCollapsed = toolbar.classList.contains("collapsed");
        localStorage.setItem("notesWorkspace.toolbarCollapsed", isNowCollapsed);
    });
}
