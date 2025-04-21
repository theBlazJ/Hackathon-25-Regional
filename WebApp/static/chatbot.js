function sendMessage() {
    let messageInput = document.getElementById("message");
    let chatBox = document.getElementById("chat");

    let userMessage = messageInput.value.trim();
    if (userMessage === "") return;

    // Display user's message in chatbox
    chatBox.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;
    messageInput.value = ""; // Clear input

    fetch("http://localhost:5000/ai_teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage })
    })
    .then(res => res.json())
    .then(data => {
        // Display AI's response
        chatBox.innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll chat
    })
    .catch(error => console.error("Error:", error));
}

// File upload functionality
function uploadFile() {
    let fileInput = document.getElementById("file-upload");
    let file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(error => console.error("Error:", error));
}

// Grading functionality
function gradePaper() {
    fetch("http://localhost:5000/grade_paper", {
        method: "POST"
    })
    .then(res => res.json())
    .then(data => alert("Grading Result: " + data.result))
    .catch(error => console.error("Error:", error));
}

// Speech to Text
function startSpeechToText() {
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    
    recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript;
        document.getElementById("message").value = transcript;
    };
    
    recognition.start();
}

document.getElementById("fileUpload").addEventListener("change", function(event) {
    let file = event.target.files[0];
    if (!file) return;

    let formData = new FormData();
    formData.append("file", file);

    fetch("http://127.0.0.1:5000/upload_paper", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.grade) {
            document.getElementById("chatbox").innerHTML += "<p><strong>Grade:</strong> " + data.grade + "</p>";
        } else {
            document.getElementById("chatbox").innerHTML += "<p>Error grading file.</p>";
        }
    })
    .catch(error => console.error("Error:", error));
});
