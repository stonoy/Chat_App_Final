import React from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { RiAdminFill } from "react-icons/ri";
import { BsSunFill, BsSun } from "react-icons/bs";
import { NavLink, useLoaderData } from "react-router-dom";

const Header = ({ logout, toggleTheme, stateTheme }) => {
  const { currentUser } = useLoaderData();

  const toggleThemeBtn = stateTheme !== "cupcake" ? <BsSunFill /> : <BsSun />;

  return (
    <header className="bg-neutral py-4 text-neutral-content">
      <div className="align-element px-2 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat App</h1>
        <div className="flex gap-2 items-center">
          <button onClick={toggleTheme} className="btn btn-sm btn-neutral">
            {toggleThemeBtn}
          </button>
          {currentUser.role === "admin" && (
            <NavLink to="/dashboard/admin">
              <RiAdminFill className="text-lg text-neutral-content  rounded-lg" />
            </NavLink>
          )}
          <NavLink
            to={`/dashboard/profile`}
            className="text-lg font-bold capitalize"
          >
            {currentUser.name || "user"}
          </NavLink>
          <button className="text-lg btn-sm rounded-lg" onClick={logout}>
            <AiOutlineLogout />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
