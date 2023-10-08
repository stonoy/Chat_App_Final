import React from "react";
import { customFetch } from "../utils/all";
import { redirect } from "react-router-dom";

export const action = async ({ params }) => {
  const { id } = params;
  try {
    const { data } = await customFetch.post("/chat", { id });
    // console.log(data);
    return redirect(`/dashboard/chat/${data.chat._id}`);
  } catch (error) {
    console.log(error?.response?.data?.msg);
    return redirect("/dashboard");
  }
};
