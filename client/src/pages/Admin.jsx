import React from "react";
import { customFetch } from "../utils/all";
import { redirect, useLoaderData } from "react-router-dom";

export const loader = async () => {
  try {
    const { data } = await customFetch.get("/user/admin");
    const { numOfUsers, numOfChats, numOfMessages } = data;
    return { numOfUsers, numOfChats, numOfMessages };
  } catch (error) {
    console.log(error?.response?.data?.msg);
    return redirect("/dashboard");
  }
};

const Admin = () => {
  const { numOfUsers, numOfChats, numOfMessages } = useLoaderData();
  return (
    <div className="flex flex-col gap-2 justify-center items-center md:flex-row">
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{numOfUsers}</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Total Chats</div>
          <div className="stat-value">{numOfChats}</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Total Messages</div>
          <div className="stat-value">{numOfMessages}</div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
