import React, { useEffect } from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from "react-router-dom";
import { customFetch } from "../utils/all";
import chat_svg from "/chat-svg.svg";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  let err = "";
  if (data.password.length < 6) {
    err = "password should be at least six characters long";
    return err;
  }

  try {
    await customFetch.post("/auth/login", data);
    console.log("login successful");
    return redirect("/dashboard");
  } catch (error) {
    console.log(error?.response?.data?.msg);
    err = error?.response?.data?.msg;
    return err;
  }
};

const Login = ({ getTheme }) => {
  const err = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    getTheme();
  }, []);

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content align-element flex-col gap-2 lg:flex-row lg:gap-4">
        <div className="text-center flex flex-col justify-center  lg:text-left">
          <h1 className="text-5xl text-accent font-bold">Login now!</h1>
          <p className="py-6 text-lg">
            A real-time chat application is a software application that enables
            users to exchange messages and communicate with each other in
            real-time.
          </p>
          <img
            src={chat_svg}
            alt="Chat_App"
            className="hidden lg:inline-block w-[400px] m-auto"
          />
        </div>
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <Form className="card-body" method="post">
            <h2 className="text-lg w-fit mx-auto">Login Here</h2>
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text">Email</span>
              </label>
              <input
                type="text"
                name="email"
                id="email"
                placeholder="email"
                className="input input-bordered"
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="password"
                className="input input-bordered"
              />
              <label className="label mt-4">
                New Here ...
                <Link
                  to="/register"
                  className="text-primary-content-500 border-b-2"
                >
                  Register
                </Link>
              </label>
            </div>
            <div className="form-control mt-4">
              <button className="btn btn-accent" type="submit">
                Login{" "}
                {isSubmitting && (
                  <span className="loading loading-spinner"></span>
                )}
              </button>
            </div>
            {err && <p className="text-error w-fit mx-auto font-bold">{err}</p>}
          </Form>
        </div>
      </div>
    </main>
  );
};

export default Login;
