const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("message", (data) => {
        console.log("Message received:", data);
        io.emit("message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(3000, () => console.log("Node.js Server on http://localhost:3000"));
