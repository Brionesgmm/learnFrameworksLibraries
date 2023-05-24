const express = require("express");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

mongoose
  .connect(
    "mongodb+srv://jbrionesgmm:Brucelee7!S@testchat.c4ssd1f.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));

app.use(cors());

io.on("connection", (socket) => {
  console.log("New client connected");

  Message.find()
    .sort("-timestamp")
    .limit(50)
    .then((messages) => {
      console.log("Fetched messages: ", messages);
      socket.emit("message history", messages);
    })
    .catch((err) => console.error(err));

  socket.on("message", (content) => {
    console.log("Received message content: ", content);
    const message = new Message({ content });

    message
      .save()
      .then((savedMessage) => {
        console.log("Saved message: ", savedMessage);
        io.emit("message", savedMessage);
      })
      .catch((err) => console.error(err));
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started on port ${process.env.PORT || 5000}`)
);
