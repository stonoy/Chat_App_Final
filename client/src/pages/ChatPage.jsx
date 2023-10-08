import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  redirect,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { customFetch, getCurrentDateTime } from "../utils/all";
import { AiOutlineArrowDown } from "react-icons/ai";
import { GoDotFill } from "react-icons/go";
import moment from "moment";

export const loader = async ({ params }) => {
  const { id: chatId } = params;

  try {
    const { data } = await customFetch.get(`/chat/${chatId}`);

    return data;
  } catch (error) {
    console.log(error?.response?.data?.msg);
    return redirect("/dashboard");
  }
};

// export const action = async ({ params, request }) => {
//   const { id: chatId } = params;
//   console.log(request);
//   const formData = await request.formData();
//   const { text } = Object.fromEntries(formData);

//   // console.log(text);

//   try {
//     await customFetch.post("/message", { text, chat: chatId });
//     console.log("message sent");
//   } catch (error) {
//     console.log(error?.response?.data?.msg);
//   }

//   return null;
// };

const ChatPage = () => {
  const { chat, messagesOfTheChat } = useLoaderData();
  const { currentUser, socket, onlineUsers } = useOutletContext();
  const [stateChat, setStateChat] = useState(chat);
  const [stateMessagesOfTheChat, setStateMessagesOfTheChat] =
    useState(messagesOfTheChat);

  const [text, setText] = useState("");
  const [isRecipientUserTyping, setIsRecipientUserTyping] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  // const location = useLocation()
  const params = useParams();

  // console.log(chat);
  // console.log(stateChat);

  const openChatId = params.id;
  // console.log(moment().format("DD-MM-YYYY hh-mm-ss"))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [stateMessagesOfTheChat]);

  const handelSubmit = async (e) => {
    e.preventDefault();

    let msgBodyForSocket = {
      chat: stateChat._id,
      sender: currentUser._id,
      text,
      read: false,
      createdAt: getCurrentDateTime(),
      updatedAt: getCurrentDateTime(),
      members: stateChat.members,
    };

    socket.emit("send-msg", msgBodyForSocket);

    try {
      await customFetch.post("/message", { text, chat: openChatId });
      console.log("message sent");
    } catch (error) {
      console.log(error?.response?.data?.msg);
    }

    setText("");
  };

  useEffect(() => {
    socket.off("receive-msg").on("receive-msg", (msgBody) => {
      if (stateChat._id === msgBody.chat) {
        console.log("new msg in");
        let msgUpdated = { ...msgBody };
        setStateMessagesOfTheChat((prevState) => [...prevState, msgUpdated]);
      }
    });
  }, []);

  useEffect(() => {
    socket
      .off("receive-deleteAll-chat-two")
      .on("receive-deleteAll-chat-two", (data) => {
        navigate("/dashboard");
      });
  }, []);

  // console.log(stateChat);

  const recipientUser = stateChat.members.find(
    (member) => member._id !== currentUser._id
  );

  // console.log(recipientUser)

  const isReciprocalUserBlocked =
    recipientUser.blocklist.includes(currentUser._id) ||
    currentUser.blocklist.some((user) => user._id === recipientUser._id);

  // console.log(isReciprocalUserBlocked);

  const isRecipientUserOnline = onlineUsers.includes(recipientUser._id);

  const lastMsgSender = stateMessagesOfTheChat.slice(-1)[0]?.sender;
  // console.log(lastMsgSender)

  useEffect(() => {
    const updateChatsAndMsg = async () => {
      // console.log('danger')
      try {
        await customFetch.patch(`/chat/${openChatId}`, { lastMsgSender });
        console.log("msg read updated for the chat");
      } catch (error) {
        console.log(error?.response?.data?.msg);
      }
    };

    // console.log(isReciprocalUserBlocked)

    if (lastMsgSender !== currentUser._id) {
      // console.log('in')
      const activeChatInfo = {
        openChatId,
        lastMsgSender,
        members: stateChat.members.map((member) => member._id),
      };
      socket.emit("send-active-chatInfo", activeChatInfo);
      updateChatsAndMsg();
    }
  }, [stateMessagesOfTheChat.length]);

  useEffect(() => {
    socket
      .off("receive-active-chatInfo-two")
      .on("receive-active-chatInfo-two", (data) => {
        // console.log(data)
        setStateMessagesOfTheChat((prev) => {
          console.log("in");
          return prev.map((msg) => {
            if (msg.sender === data.lastMsgSender) {
              return { ...msg, read: true, updatedAt: getCurrentDateTime() };
            }
            return msg;
          });
        });
      });
  }, []);

  useEffect(() => {
    socket.off("receive-show-typing").on("receive-show-typing", (data) => {
      // console.log('typing')
      if (data.openChatId === openChatId && data.typer !== currentUser._id) {
        bottomRef.current?.scrollIntoView({ behavior: "instant" });
        setIsRecipientUserTyping(true);
      }

      setTimeout(() => {
        setIsRecipientUserTyping(false);
      }, 2000);
    });
  }, []);

  useEffect(() => {
    socket
      .off("receive-block-update-one")
      .on("receive-block-update-one", ({ blockUserId }) => {
        let modifiedMembers = stateChat.members.map((member) => {
          if (member._id !== blockUserId) {
            return { ...member, blocklist: [...member.blocklist, blockUserId] };
          }
          return member;
        });

        setStateChat((prev) => {
          return { ...prev, members: modifiedMembers };
        });
      });
  }, []);

  return (
    <div className="h-[80vh] flex flex-col w-full bg-base-100 text-base-content">
      {/* {RECIPIENT USER} */}
      <div className="px-4 py-4 border-b-2 border-base-300 flex justify-between items-center ">
        <h1 className="text-base font-semibold capitalize">
          {recipientUser.name}
          {isRecipientUserOnline && !isReciprocalUserBlocked && (
            <button>
              <GoDotFill className="text-green-500" />
            </button>
          )}
        </h1>
        <div className="tooltip" data-tip="Scroll Chat Botton">
          <button
            className="btn btn-sm"
            onClick={() =>
              bottomRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <AiOutlineArrowDown />
          </button>
        </div>
      </div>

      {/* {CHAT BOX} */}
      <div className="overflow-y-scroll p-4 h-[60vh] overscroll-contain">
        {stateMessagesOfTheChat.map((message) => {
          const sentByYou = message.sender === currentUser._id;
          const messageBody = message.text
            .split("\n")
            .map((line) => <p>{line}</p>);
          // console.log(messageBody);
          const { _id, read, createdAt, updatedAt } = message;
          // console.log(read)

          return (
            <div
              key={_id}
              className={`chat ${sentByYou ? "chat-end " : "chat-start"}`}
            >
              <div
                className={`chat-bubble ${
                  sentByYou && "bg-neutral-content text-neutral"
                }`}
              >
                {messageBody}
              </div>
              {sentByYou && (
                <div className="chat-footer opacity-50">
                  {read
                    ? `Seen at ${moment(updatedAt).format("h:mm a")}`
                    : `Sent at ${moment(createdAt).format("h:mm a")}`}
                </div>
              )}
            </div>
          );
        })}
        {isRecipientUserTyping && (
          <div className="chat chat-start">
            <div className="chat-bubble bg-success text-base-content opacity-50">
              typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* {SEND MESSAGE} */}
      <div className="p-4 ">
        <div
          className="flex gap-2 w-full"
          // method="post"
          // preventScrollReset={true}
        >
          <textarea
            name="text"
            placeholder="type here..."
            wrap="hard"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (!isReciprocalUserBlocked) {
                socket.emit("send-show-typing", {
                  openChatId,
                  typer: currentUser._id,
                  members: stateChat.members.map((member) => member._id),
                });
              }
            }}
            className=" textarea-sm  overflow-y-hidden resize-none leading-3 w-full border-2 border-base-300 md:input-md"
          ></textarea>
          <button
            type="submit"
            disabled={isReciprocalUserBlocked}
            className="btn btn-xs text-accent-focus sm:btn-sm md:btn-md"
            onClick={handelSubmit}
            onKeyDown={(e) => {
              console.log(e.key);
              if (e.key === "Enter") e.preventDefault();
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
