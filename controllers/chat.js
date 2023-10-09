import { StatusCodes } from "http-status-codes";
import Chat from "../models/chat.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import customApiError from "../errors/cutomError.js";

const getAllChats = async (req, res, next) => {
  const userPresent = await User.findOne({ _id: req.user.userId }); // REST CALLS TO BUY SOME TIME
  const userPresent1 = await User.findOne({ _id: req.user.userId });
  const userPresent2 = await User.findOne({ _id: req.user.userId });
  const userPresent3 = await User.findOne({ _id: req.user.userId });
  const userPresent4 = await User.findOne({ _id: req.user.userId });
  const userPresent5 = await User.findOne({ _id: req.user.userId });

  const chats = await Chat.find({
    members: { $in: [req.user.userId] },
  })
    .populate({ path: "members", select: "_id name blocklist" })
    .populate({
      path: "lastMessage",
      select: "_id sender text createdAt",
    });

  res.status(200).json({ chats });
};

const createChat = async (req, res, next) => {
  let members = [];
  members.push(req.user.userId);
  members.push(req.body.id);

  const chat = await Chat.create({ members });

  res.status(StatusCodes.CREATED).json({ chat });
};

const getSingleChat = async (req, res, next) => {
  const chat = await Chat.findOne({ _id: req.params.id }).populate({
    path: "members",
    select: "_id name",
  });

  if (!chat) {
    return next(
      customApiError(
        `chat id: ${req.params.id} not found`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  const recipientUser = chat.members.find(
    (member) => member._id.toString() !== req.user.userId
  );

  await Message.updateMany(
    { sender: recipientUser._id, chat: chat._id },
    { read: true }
  );

  const remainingUnreadMsg = await Message.countDocuments({
    chat: chat._id,
    read: false,
  });

  await Chat.findOneAndUpdate(
    { _id: req.params.id },
    { unreadMessages: remainingUnreadMsg }
  );

  const updatedChat = await Chat.findOne({ _id: req.params.id }).populate({
    path: "members",
    select: "_id name blocklist",
  });

  const messagesOfTheChat = await Message.find({ chat: chat._id });

  res.status(200).json({ chat: updatedChat, messagesOfTheChat });
};

const updateChat = async (req, res, next) => {
  const chat = await Chat.findOne({ _id: req.params.id });

  if (!chat) {
    return next(
      customApiError(
        `chat id: ${req.params.id} not found`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  await Message.updateMany(
    { sender: req.body.lastMsgSender, chat: chat._id },
    { read: true }
  );

  const remainingUnreadMsg = await Message.countDocuments({
    chat: chat._id,
    read: false,
  });

  await Chat.findOneAndUpdate(
    { _id: req.params.id },
    { unreadMessages: remainingUnreadMsg }
  );

  res.status(200).json({ msg: "chat and msg read status updated" });
};

const deleteChat = async (req, res, next) => {
  const chat = await Chat.findOne({ _id: req.params.id });

  if (!chat) {
    return next(
      customApiError(
        `chat id: ${req.params.id} not found`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  await chat.deleteOne();
  res.send("deleteChat");
};

export { getAllChats, createChat, getSingleChat, updateChat, deleteChat };
