import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { socket } from "./socket";

import {
  HomeLayOut,
  Login,
  Register,
  ErrorPage,
  DefaultChatPage,
  ChatPage,
  Profile,
  Admin,
} from "./pages";
import { ErrorElement } from "./components";

import { action as loginAction } from "./pages/Login";
import { action as registerAction } from "./pages/Register";
import { action as createChatAction } from "./pages/CreateChat";
// import { action as sendMessageAction } from "./pages/ChatPage";
import { action as profileAction } from "./pages/Profile";
import { action as removeBlockaction } from "./pages/RemoveBlock";

import { loader as dashboardLoader } from "./pages/HomeLayOut";
import { loader as chatLoader } from "./pages/ChatPage";
import { loader as adminLoader } from "./pages/Admin";

const router = createBrowserRouter([
  {
    path: "dashboard",
    element: <HomeLayOut socket={socket} />,
    errorElement: <ErrorPage />,
    loader: dashboardLoader,
    // shouldRevalidate : ({ currentUrl }) => {
    //   // only revalidate if the submission originates from
    //   // the `/meal-plans/new` route.
    //   return currentUrl.pathname === "/dashboard/chat/:id";
    // },
    children: [
      {
        index: true,
        element: <DefaultChatPage />,
        errorElement: <ErrorElement />,
      },
      {
        path: "chat/:id",
        element: <ChatPage />,
        errorElement: <ErrorElement />,
        loader: chatLoader,
        // shouldRevalidate : ({ currentUrl }) => {
        //   // only revalidate if the submission originates from
        //   // the `/meal-plans/new` route.
        //   return currentUrl.pathname === "/dashboard/chat/:id";
        // },
        // action: sendMessageAction,
      },
      {
        path: "createchat/:id",
        action: createChatAction,
      },
      {
        path: "removeblock/:id",
        action: removeBlockaction,
      },
      {
        path: "profile",
        element: <Profile />,
        errorElement: <ErrorElement />,
        action: profileAction,
      },
      {
        path: "admin",
        element: <Admin />,
        errorElement: <ErrorElement />,
        loader: adminLoader,
      },
    ],
  },
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
    action: loginAction,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <ErrorPage />,
    action: registerAction,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
