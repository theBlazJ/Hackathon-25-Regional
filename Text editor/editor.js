$(document).ready(function () {
    let optionButton = $(".option-button");
    let advancedOptionButton = $(".adv-option-button");
    let fontName = $("#fontName");
    let fontSize = $("#fontSize");
    let writingArea = $("#text-input");
    let linkButton = $("#createLink");
    let alignButton = $(".align");
    let spacingButton = $(".spacing");
    let formatButton = $(".format");
    let scriptButton = $(".script");

    let fontList = [
        "Arial", "Verdana", "Times New Roman",
        "Garamond", "Georgia", "Courier New", "cursive"
    ];

    // Initialize editor
    const initializer = () => {
        highlighter(alignButton, true);
        highlighter(scriptButton, true);
        highlighter(formatButton, true);

        // Populate font list
        fontList.forEach((font) => {
            fontName.append($("<option></option>").val(font).text(font));
        });

        // Populate font sizes
        for (let i = 1; i <= 7; i++) {
            fontSize.append($("<option></option>").val(i).text(i));
        }

        fontSize.val(3); // Default font size
    };

    // Function to modify text properties
    const modifyText = (command, defaultUi = false, value = null) => {
        document.execCommand(command, defaultUi, value);
    };

    // Text formatting buttons
    formatButton.on("click", function () {
        $(this).toggleClass("active");
        modifyText($(this).attr("id"));
    });

    // Alignment buttons
    alignButton.on("click", function () {
        modifyText($(this).attr("id"));
    });

    // Subscript/Superscript buttons
    scriptButton.on("click", function () {
        modifyText($(this).attr("id"));
    });

    // Text & Background Color
    $("#colorPicker").on("input", function () {
        modifyText("foreColor", false, $(this).val());
    });

    $("#bgColorPicker").on("input", function () {
        modifyText("hiliteColor", false, $(this).val());
    });

    // Insert unordered list
    $("#insertUnorderedList").on("click", function () {
        modifyText("insertUnorderedList", false, null);
        $(this).toggleClass("active");
    });

    // Insert ordered list
    $("#insertOrderedList").on("click", function () {
        modifyText("insertOrderedList", false, null);
        $(this).toggleClass("active");
    });

    // Hyperlink
    linkButton.on("click", function () {
        let url = prompt("Enter a URL:");
        if (url) {
            if (!/^http/i.test(url)) {
                url = "http://" + url;
            }
            modifyText("createLink", false, url);
        }
    });

    // Save & Load functionality
    $("#save").on("click", function () {
        localStorage.setItem("savedText", writingArea.html());
        alert("Text saved!");
    });

    $("#load").on("click", function () {
        let savedText = localStorage.getItem("savedText");
        if (savedText) {
            writingArea.html(savedText);
            alert("Text loaded!");
        } else {
            alert("No saved text found.");
        }
    });

    // Apply font change with better browser compatibility
    fontName.on("change", function () {
        let selectedFont = $(this).val();
        document.execCommand("fontName", false, selectedFont);
        document.execCommand("insertHTML", false, `<span style="font-family: ${selectedFont};">${window.getSelection()}</span>`);
    });

    // Apply font size
    fontSize.on("change", function () {
        let sizeValue = $(this).val();
        document.execCommand("fontSize", false, sizeValue);
    });

    // Advanced text options
    optionButton.on("click", function () {
        $(this).toggleClass("active");
        modifyText($(this).attr("id"), false, $(this).val());
    });

    advancedOptionButton.on("change", function () {
        modifyText($(this).attr("id"), false, $(this).val());
    });

    // Highlighter function to manage button active states
    const highlighter = (className, needsRemoval) => {
        className.on("click", function () {
            if (needsRemoval) {
                let alreadyActive = $(this).hasClass("active");
                highlighterRemover(className);
                if (!alreadyActive) {
                    $(this).addClass("active");
                }
            }
        });
    };

    const highlighterRemover = (className) => {
        className.removeClass("active");
    };

    initializer();
});
