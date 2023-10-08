import React, { useEffect, useState } from "react";
import {
  Form,
  Link,
  NavLink,
  useLoaderData,
  useLocation,
  useNavigate,
  useSubmit,
} from "react-router-dom";
import {
  BsArrowBarLeft,
  BsArrowBarRight,
  BsFillPlusCircleFill,
  BsFillArrowUpRightCircleFill,
  BsThreeDotsVertical,
} from "react-icons/bs";
import { GoDotFill } from "react-icons/go";
import moment from "moment";
import { customFetch } from "../utils/all";

const SideBar = ({ stateChats, onlineUsers, socket }) => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  let { allUsers, currentUser } = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  const submit = useSubmit();

  // console.log(screen.width);
  // console.log(location);

  const bigScreen = screen.width > 767;
  // console.log(stateChats);

  const toggleButton = isSideBarOpen ? (
    <BsArrowBarLeft
      onClick={() => setIsSideBarOpen((prevState) => !prevState)}
    />
  ) : (
    <BsArrowBarRight
      onClick={() => setIsSideBarOpen((prevState) => !prevState)}
    />
  );

  const debounce = (onChange) => {
    let timeout;
    return (e) => {
      const form = e.currentTarget;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        onChange(form);
      }, 1500);
    };
  };

  const blockUser = async (blockUserId, chatId) => {
    socket.emit("send-block-update", { blockUserId, chatId });
    try {
      await customFetch.patch(`/user/${blockUserId}`);
      console.log("blocked !");
      navigate(0);
    } catch (error) {
      console.log(error?.response?.data?.msg);
    }
  };

  // const deleteMeChat = (deleteChatId, members) => {
  //   socket.emit("send-deleteMe-chat", {
  //     deleteChatId,
  //     members,
  //     deleter: currentUser._id,
  //   });
  // };

  const deleteAllChat = async (deleteChatId, members) => {
    socket.emit("send-deleteAll-chat", {
      deleteChatId,
      members,
      deleter: currentUser._id,
    });
    try {
      await customFetch.delete(`/chat/${deleteChatId}`);
      console.log("Chat deleted !");
      navigate(0);
    } catch (error) {
      console.log(error?.response?.data?.msg);
    }
  };

  return (
    <aside className="flex flex-col items-end ">
      <button className="btn btn-sm ">{toggleButton}</button>
      <div
        className={isSideBarOpen ? "flex flex-col w-20 md:w-auto" : "hidden"}
      >
        <Form
          onChange={debounce((form) => {
            submit(form);
          })}
          className="form-control w-full max-w-xs my-4"
        >
          <input
            type="text"
            name="name"
            placeholder="search"
            defaultValue={""}
            className="  input-sm p-2  rounded-md w-full max-w-xs md:input-sm md:p-4 "
          />
        </Form>
        {/* {SEARCH USERS RESULT} */}
        <div className="border-2 border-neutral-content w-full">
          {allUsers.map((user) => {
            // console.log(stateChats);
            let hadChat = false;
            stateChats.forEach((chat) =>
              chat.members.forEach((member) => {
                if (member._id === user._id) {
                  hadChat = true;
                }
              })
            );
            // console.log(hadChat);
            if (user._id === currentUser._id) {
              return;
            }
            return (
              <div
                className="btn btn-md flex flex-row justify-center items-center w-full text-xs text-base-content border-base-300 my-1 md:text-base"
                key={user._id}
              >
                {user.name}
                {hadChat ? (
                  <NavLink to={`./chat/${hadChat._id}`}>
                    <BsFillArrowUpRightCircleFill className="text-base" />
                  </NavLink>
                ) : (
                  <Form method="post" action={`./createchat/${user._id}`}>
                    <button className="text-base">
                      <BsFillPlusCircleFill />
                    </button>
                  </Form>
                )}
              </div>
            );
          })}
        </div>
        {/* {CHAT HEADS HERE} */}
        <div className=" w-full ">
          {stateChats.map((chat) => {
            // if (!chat.lastMessage && ) {
            //   return;
            // }
            const recipientUser = chat.members.find(
              (member) => member._id !== currentUser._id
            );
            console.log(recipientUser);
            const isRecipientUserOnline = onlineUsers.includes(
              recipientUser._id
            );
            const isReciprocalUserBlocked =
              recipientUser.blocklist.includes(currentUser._id) ||
              currentUser.blocklist.some(
                (user) => user._id === recipientUser._id
              );

            const senderId = chat.lastMessage?.sender;
            const isLastMsgByMe = senderId === currentUser._id;
            return (
              <button
                className="btn btn-md px-0 h-fit border-2 border-accent  text-start  w-full text-xs text-base-content  my-1 md:text-base md:px-0.5"
                key={chat._id}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex gap-1 justify-center items-center">
                    <a className="text-md" href={`/dashboard/chat/${chat._id}`}>
                      {recipientUser.name}
                    </a>
                    {isRecipientUserOnline && !isReciprocalUserBlocked && (
                      <button>
                        <GoDotFill className="text-green-500" />
                      </button>
                    )}
                    {chat.unreadMessages > 0 && !isLastMsgByMe && (
                      <div className="badge px-0.5  badge-secondary ">
                        {chat.unreadMessages}
                      </div>
                    )}
                    <div className="dropdown">
                      <label tabIndex={0} className="btn btn-xs px-0 h-fit">
                        <BsThreeDotsVertical />
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-1 shadow bg-base-100 rounded-box w-fit md:p-2"
                      >
                        {/* <li
                          onClick={() => deleteMeChat(chat._id, chat.members)}
                        >
                          <a className="whitespace-nowrap text-xs md:text-sm">
                            Delete For Me
                          </a>
                        </li> */}
                        <li
                          onClick={() => deleteAllChat(chat._id, chat.members)}
                        >
                          <a className="whitespace-nowrap text-xs md:text-sm">
                            Delete All
                          </a>
                        </li>
                        <li
                          onClick={() => blockUser(recipientUser._id, chat._id)}
                        >
                          <a className="whitespace-nowrap text-xs md:text-sm">
                            Block
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {chat.lastMessage?.text && (
                    <div className="flex flex-col justify-between normal-case md:flex-row items-center">
                      <span>
                        {isLastMsgByMe ? (
                          <h3 className="text-xs font-thin md:text-sm">
                            {bigScreen
                              ? `You: ${chat.lastMessage?.text.slice(0, 10)}...`
                              : `You: ${chat.lastMessage?.text.slice(0, 2)}...`}
                          </h3>
                        ) : (
                          <h1 className="text-xs font-semibold md:text-sm">
                            {bigScreen
                              ? `${chat.lastMessage?.text.slice(0, 10)}...`
                              : `${chat.lastMessage?.text?.slice(0, 2)}...`}
                          </h1>
                        )}
                      </span>
                      <p className="text-xs font-thin md:text-sm ">
                        {chat.lastMessage?.createdAt &&
                          moment(chat.lastMessage?.createdAt).format("h:mm a")}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
