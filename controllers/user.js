import customApiError from "../errors/cutomError.js";
import User from "../models/user.js";
import Chat from "../models/chat.js";
import Message from "../models/message.js";
import { StatusCodes } from "http-status-codes";

const getAllUser = async (req, res, next) => {
  const { name } = req.query;

  let queryObject = {};

  queryObject.name = name ? { $regex: name, $options: "i" } : "";

  const users = await User.find(queryObject).select("-password");

  res.status(200).json({ users });
};

const getCurrentUser = async (req, res, next) => {
  const currentUser = await User.findOne({ _id: req.user.userId })
    .select("-password")
    .populate({
      path: "blocklist",
      select: "_id name",
    });
  if (!currentUser) {
    return next(customApiError("No such user found", StatusCodes.BAD_REQUEST));
  }

  res.status(200).json({ currentUser });
};
const getSingleUser = async (req, res, next) => {
  res.send("single users");
};

const changeName = async (req, res, next) => {
  const user = await User.findOne({ _id: req.user.userId });

  if (!user) {
    return next(
      customApiError(`Request came from an invalid user: ${req.user.userId}`),
      StatusCodes.BAD_REQUEST
    );
  }

  await User.findOneAndUpdate({ _id: req.user.userId }, req.body);

  res.status(200).json({ msg: "name changed" });
};

const removeblock = async (req, res, next) => {
  let userSender = await User.findOne({ _id: req.user.userId });

  const newBlockList = userSender.blocklist.filter((user) => {
    return user.toString() !== req.body.blockId;
  });

  await User.findOneAndUpdate(
    { _id: req.user.userId },
    { blocklist: newBlockList }
  );

  res.status(200).json({ msg: "removed from blocklist" });
};

const updateUser = async (req, res, next) => {
  let userSender = await User.findOne({ _id: req.user.userId });
  let userToBlock = await User.findOne({ _id: req.params.id });

  // if (!userSender) {
  //   return next(
  //     customApiError(`Request came from an invalid user: ${req.user.userId}`),
  //     StatusCodes.BAD_REQUEST
  //   );
  // }

  if (!userToBlock) {
    return next(
      customApiError(`Block userId invalid: ${req.params.id}`),
      StatusCodes.BAD_REQUEST
    );
  }

  // console.log(userSender)
  // await User.deleteMany({})
  // await Chat.deleteMany({})
  // await Message.deleteMany({})

  if (!userSender.blocklist.includes(req.params.id)) {
    userSender.blocklist.push(req.params.id);
    await userSender.save();
  }

  res.status(200).json({ msg: "done" });
};

const adminSpecial = async (req, res, next) => {
  const numOfUsers = await User.countDocuments();
  const numOfChats = await Chat.countDocuments();
  const numOfMessages = await Message.countDocuments();

  res.status(200).json({ numOfUsers, numOfChats, numOfMessages });
};

const deleteUser = async (req, res, next) => {
  res.send("delete users");
};

export {
  getAllUser,
  getCurrentUser,
  getSingleUser,
  updateUser,
  deleteUser,
  changeName,
  removeblock,
  adminSpecial,
};
