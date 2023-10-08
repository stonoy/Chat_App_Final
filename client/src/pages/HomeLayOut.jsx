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
    // console.log(chats);
    return { allUsers, currentUser, chats };
  } catch (error) {
    console.log(error?.response?.data?.msg);
    return redirect("/");
  }
};

const HomeLayOut = ({ socket }) => {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { currentUser, chats } = useLoaderData();
  const [stateChats, setStateChats] = useState(chats);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const isLoading = navigation.state === "loading";

  // console.log(chats);
  // console.log(stateChats);

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
      console.log("1");
      setStateChats((prev) => [...prev, newChat]);
    });
  }, []);

  useEffect(() => {
    socket.off("receive-msg-two").on("receive-msg-two", (msgBody) => {
      console.log("2");
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
              // if(sender !== currentUser._id){
              //   modifiedChatItem = {...modifiedChatItem, unreadMessages: chatItem.unreadMessages + 1}
              //   return modifiedChatItem
              // }
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
        console.log("3");
        console.log("hi");

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
        console.log(onlineUsersData.length);
        setOnlineUsers(onlineUsersData);
      });
  }, []);

  useEffect(() => {
    socket
      .off("receive-show-online-two")
      .on("receive-show-online-two", (onlineUsersData) => {
        console.log(onlineUsersData.length);
        setOnlineUsers(onlineUsersData);
      });
  }, []);

  useEffect(() => {
    function socketFunc(data) {
      console.log("4");

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

  // useEffect(() => {
  //   socket.off("receive-deleteMe-chat").on("receive-deleteMe-chat", (data) => {
  //     console.log("5");
  //     if (currentUser._id === data.deleter) {
  //       setStateChats((prev) => {
  //         return prev.filter((chat) => chat._id !== data.deleteChatId);
  //       });
  //     }
  //   });
  // }, []);

  // const createChat = async(id, name) => {
  //   console.log(id)
  //   socket.emit('create-new-msg', {members: [{_id: id, name}, {_id: currentUser._id, name: currentUser.name}], createdAt: getCurrentDateTime(), updatedAt: getCurrentDateTime()})

  //   try {
  //     await customFetch.post("/chat", { id });
  //     console.log('new chat created')
  //   } catch (error) {
  //     console.log(error?.response?.data?.msg)
  //   }
  // }

  return (
    <main className="min-h-screen">
      <Header logout={logout} />
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
