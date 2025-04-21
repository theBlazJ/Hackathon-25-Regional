const socket = io("http://localhost:3000");

socket.on("message", (data) => {
    console.log("New message:", data);
});
