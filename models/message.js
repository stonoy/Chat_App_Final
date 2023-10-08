import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "Chat",
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.post("save", async function () {
  await this.model("Chat").findOneAndUpdate(
    { _id: this.chat },
    { lastMessage: this._id }
  );
});

MessageSchema.post("save", async function () {
  const unreadMsgCount = await this.model("Message").countDocuments({
    read: false,
    chat: this.chat,
    sender: this.sender,
  });

  await this.model("Chat").findOneAndUpdate(
    { _id: this.chat },
    { unreadMessages: unreadMsgCount }
  );
});

export default mongoose.model("Message", MessageSchema);
