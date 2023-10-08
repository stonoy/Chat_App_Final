import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
    },
    unreadMessages: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

ChatSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.model("Message").deleteMany({ chat: this._id.toString() });
  }
);

export default mongoose.model("Chat", ChatSchema);
