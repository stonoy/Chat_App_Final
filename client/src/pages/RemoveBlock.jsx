import React from "react";
import { customFetch } from "../utils/all";
import { redirect } from "react-router-dom";

export const action = async ({ params }) => {
  const { id } = params;
  try {
    await customFetch.patch("/user/removeblock", { blockId: id });
    // console.log(data);
  } catch (error) {
    console.log(error?.response?.data?.msg);
  }
  return redirect(`/dashboard/profile`);
};
