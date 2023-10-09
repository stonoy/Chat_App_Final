import React, { useEffect, useState } from "react";
import { Header, Loading, SideBar } from "../components";
import {
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import { customFetch, getCurrentDateTime } from "../utils/all";

export const loader = async ({ request }) => {
  const params = Object.fromEntries([
    ...new URL(request.url).searchParams.entries(),
  ]);

  try {
    const {
      data: { currentUser },
    } = await customFetch.get("/user/getcurrentuser");

    const {
      data: { users: allUsers },
    } = await customFetch.get("/user/getalluser", {
      params,
    });

    const {
      data: { chats },
    } = await customFetch.get("/chat");

    return { allUsers, currentUser, chats };
  } catch (error) {
    console.log(error?.response?.data?.msg);
    return redirect("/");
  }
};

const HomeLayOut = ({ socket, getTheme }) => {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { currentUser, chats } = useLoaderData();
  const [stateChats, setStateChats] = useState(chats);
  const [stateTheme, setStateTheme] = useState(getTheme());
  const [onlineUsers, setOnlineUsers] = useState([]);
  const isLoading = navigation.state === "loading";

  const logout = async () => {
    socket.emit("logout", currentUser._id);
    navigate("/");
    try {
      await customFetch.get("/auth/logout");
      console.log("logout");
    } catch (error) {
      console.log(error?.response?.data?.msg);
    }
  };

  const toggleTheme = () => {
    const newTheme = stateTheme === "cupcake" ? "luxury" : "cupcake";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setStateTheme(newTheme);
  };

  useEffect(() => {
    setStateChats(chats);
  }, [chats.length]);

  useEffect(() => {
    socket.emit("join-room", currentUser._id);
  }, []);

  useEffect(() => {
    socket.emit("send-show-online", currentUser._id);
  }, []);

  useEffect(() => {
    socket.off("send-new-msg").on("send-new-msg", (newChat) => {
      setStateChats((prev) => [...prev, newChat]);
    });
  }, []);

  useEffect(() => {
    socket.off("receive-msg-two").on("receive-msg-two", (msgBody) => {
      const { chat, sender, text, createdAt, members } = msgBody;

      setStateChats((prev) => {
        if (prev.find((chatItem) => chatItem._id === chat)) {
          return prev.map((chatItem) => {
            if (chatItem._id === chat) {
              let modifiedChatItem = {
                ...chatItem,
                lastMessage: { sender, text, createdAt },
                unreadMessages: chatItem.unreadMessages + 1,
              };

              return modifiedChatItem;
            }
            return chatItem;
          });
        }
        return [
          ...prev,
          {
            _id: chat,
            members,
            unreadMessages: 1,
            lastMessage: { sender, text, createdAt },
            createdAt: getCurrentDateTime(),
            updatedAt: getCurrentDateTime(),
          },
        ];
      });
    });
  }, []);

  useEffect(() => {
    socket
      .off("receive-active-chatInfo-one")
      .on("receive-active-chatInfo-one", (data) => {
        setStateChats((prev) => {
          return prev.map((chatItem) => {
            if (chatItem._id === data.openChatId) {
              return { ...chatItem, unreadMessages: 0 };
            }
            return chatItem;
          });
        });
      });
  }, []);

  useEffect(() => {
    socket
      .off("receive-show-online-one")
      .on("receive-show-online-one", (onlineUsersData) => {
        setOnlineUsers(onlineUsersData);
      });
  }, []);

  useEffect(() => {
    socket
      .off("receive-show-online-two")
      .on("receive-show-online-two", (onlineUsersData) => {
        setOnlineUsers(onlineUsersData);
      });
  }, []);

  useEffect(() => {
    function socketFunc(data) {
      setStateChats((prev) => {
        return prev.filter((chat) => chat._id !== data.deleteChatId);
      });
    }
    socket.on("receive-deleteAll-chat-one", socketFunc);

    return () => {
      socket.off("receive-deleteAll-chat-one", socketFunc);
    };
  }, []);

  useEffect(() => {
    socket
      .off("receive-block-update-two")
      .on("receive-block-update-two", ({ blockUserId, chatId }) => {
        setStateChats((prev) => {
          return prev.map((chat) => {
            if (chat._id === chatId) {
              let modifiedMembers = chat.members.map((member) => {
                if (member._id !== blockUserId) {
                  return {
                    ...member,
                    blocklist: [...member.blocklist, blockUserId],
                  };
                }
                return member;
              });
              return { ...chat, members: modifiedMembers };
            }
            return chat;
          });
        });
      });
  }, []);

  return (
    <main className="min-h-screen">
      <Header
        logout={logout}
        toggleTheme={toggleTheme}
        stateTheme={stateTheme}
      />
      <section className=" bg-base-300 h-screen">
        <div className="align-element grid grid-cols-[auto_1fr] gap-2 py-6 px-2 md:gap-6">
          <SideBar
            stateChats={stateChats}
            onlineUsers={onlineUsers}
            socket={socket}
          />
          {isLoading ? (
            <Loading />
          ) : (
            <Outlet context={{ currentUser, socket, onlineUsers }} />
          )}
        </div>
      </section>
    </main>
  );
};

export default HomeLayOut;
