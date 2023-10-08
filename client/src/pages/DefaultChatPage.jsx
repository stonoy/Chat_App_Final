import React from "react";
import { Form } from "react-router-dom";
import main_svg from "/main-svg.svg";

const DefaultChatPage = () => {
  return (
    <div className="py-2">
      <h1 className="text-xl w-fit text-accent-focus m-auto mb-6 font-bold lg:text-3xl">
        The Chat App
      </h1>
      <img
        src={main_svg}
        alt="Chat_App"
        className="w-full p-2 py-4 lg:w-[500px] m-auto"
      />
    </div>
  );
};

export default DefaultChatPage;
