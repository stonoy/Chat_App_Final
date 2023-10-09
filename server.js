import "express-async-errors";
import express from "express";
import mongoose from "mongoose";
import {} from "dotenv/config";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production" ? false : ["http://localhost:5173"],
  },
});

import UserRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";
import chatRouter from "./routes/chat.js";
import messageRouter from "./routes/message.js";
import authentication from "./middlewares/Auth_Middleware.js";
import Not_Found from "./middlewares/Not_Found.js";
import Error_Handler from "./middlewares/Error_Handler.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.static(path.resolve(__dirname, "./client/dist"))); // PROVIDING FRONTEND APP
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());

// app.get("/", (req, res) => {
//   res.send("welcome");
// });

// LIST OF THE ONLINE USERS => SOCKET CONNECTION DO NOT STORE ANY DATA
let onlineUsers = [];

io.on("connection", (socket) => {
  // ALL SOCKET OPERATIONS WILL BE HERE
  socket.on("join-room", (userId) => {
    console.log(`user joined: ${userId}`);
    socket.join(userId);
  });

  socket.on("send-msg", (msgBody) => {
    console.log(msgBody.chat);
    io.to(msgBody.members[0]._id)
      .to(msgBody.members[1]._id)
      .emit("receive-msg", msgBody);

    io.to(msgBody.members[0]._id)
      .to(msgBody.members[1]._id)
      .emit("receive-msg-two", msgBody);
  });

  socket.on("send-active-chatInfo", (activeChatInfo) => {
    io.to(activeChatInfo.members[0])
      .to(activeChatInfo.members[1])
      .emit("receive-active-chatInfo-one", activeChatInfo);

    io.to(activeChatInfo.members[0])
      .to(activeChatInfo.members[1])
      .emit("receive-active-chatInfo-two", activeChatInfo);
  });

  socket.on("send-show-typing", (data) => {
    io.to(data.members[0])
      .to(data.members[1])
      .emit("receive-show-typing", data);
  });

  socket.on("send-show-online", (userId) => {
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
    }
    io.emit("receive-show-online-one", onlineUsers);
  });

  socket.on("logout", (userId) => {
    onlineUsers = onlineUsers.filter((user) => user !== userId);
    io.emit("receive-show-online-two", onlineUsers);
  });

  socket.on("send-deleteAll-chat", (data) => {
    io.to(data.members[0]._id)
      .to(data.members[1]._id)
      .emit("receive-deleteAll-chat-one", data);

    io.to(data.members[0]._id)
      .to(data.members[1]._id)
      .emit("receive-deleteAll-chat-two", data);
  });

  socket.on("send-block-update", (data) => {
    io.to(data.blockUserId).emit("receive-block-update-one", data);
    io.to(data.blockUserId).emit("receive-block-update-two", data);
  });
});

app.use("/api/node/auth", authRouter);
app.use("/api/node/user", authentication, UserRouter);
app.use("/api/node/chat", authentication, chatRouter);
app.use("/api/node/message", authentication, messageRouter);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/dist", "index.html")); // SERVER GIVEING FRONTEND APP TO USERS
});

app.use(Not_Found);
app.use(Error_Handler);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    server.listen(port, () => {
      console.log(`server is listening on port: ${port}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
