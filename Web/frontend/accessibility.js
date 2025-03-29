document.addEventListener("DOMContentLoaded", function () {
    // Apply saved settings when page loads
    applySettings();

    // Save settings when clicking "Save"
    document.getElementById("saveSettings")?.addEventListener("click", saveSettings);
});

function saveSettings() {
    localStorage.setItem("username", document.getElementById("user-name").value);
    localStorage.setItem("mode", document.querySelector('input[name="mode"]:checked').value);
    localStorage.setItem("font", document.getElementById("fontSelector").value);
    localStorage.setItem("textSize", document.getElementById("textSizeSelector").value);
    localStorage.setItem("colorBlindMode", document.getElementById("colorBlindSelector").value);

    alert("Settings saved! Refresh pages to apply changes.");
}

function applySettings() {
    // Apply Dark/Light Mode
    const mode = localStorage.getItem("mode");
    if (mode === "darkmode") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }

    // Apply Font Style
    const font = localStorage.getItem("font");
    if (font) {
        document.body.style.fontFamily = font;
    }

    // Apply Text Size
    const textSize = localStorage.getItem("textSize");
    document.body.classList.remove("small-text", "large-text");
    if (textSize === "small") {
        document.body.classList.add("small-text");
    } else if (textSize === "large") {
        document.body.classList.add("large-text");
    }

    // Apply Color Blind Mode
    const colorBlindMode = localStorage.getItem("colorBlindMode");
    document.body.classList.remove("deuteranopia", "protanopia", "tritanopia");

    if (colorBlindMode && colorBlindMode !== "none") {
        document.body.classList.add(colorBlindMode);
    }

    applyColorBlindStyles(colorBlindMode);
}

function applyColorBlindStyles(mode) {
    const images = document.querySelectorAll("img");
    switch (mode) {
        case "deuteranopia":
            images.forEach(img => img.style.filter = "sepia(100%) hue-rotate(190deg) saturate(50%)");
            break;
        case "protanopia":
            images.forEach(img => img.style.filter = "sepia(100%) hue-rotate(160deg) saturate(60%)");
            break;
        case "tritanopia":
            images.forEach(img => img.style.filter = "sepia(100%) hue-rotate(90deg) saturate(70%)");
            break;
        default:
            images.forEach(img => img.style.filter = "none");
    }
}
