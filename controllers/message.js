import { StatusCodes } from "http-status-codes";
import Message from "../models/message.js";

const getAllMessages = async (req, res, next) => {
  console.log(req.user);
  res.send("getAllMessages");
};

const createMessage = async (req, res, next) => {
  req.body.sender = req.user.userId;
  await Message.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "message sent" });
};

const deleteMessage = async (req, res, next) => {
  res.send("deleteMessage");
};

export { getAllMessages, createMessage, deleteMessage };
