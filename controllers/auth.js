import customApiError from "../errors/cutomError.js";
import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      customApiError("provide required details", StatusCodes.BAD_REQUEST)
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(
      customApiError("email is not registered", StatusCodes.BAD_REQUEST)
    );
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return next(customApiError("Incorrect Password", StatusCodes.UNAUTHORIZED));
  }

  const token = await user.createToken();

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 3600 * 24*1000),
    secrue: process.env.NODE_ENV === "production",
  });

  res.status(StatusCodes.CREATED).json({ msg: "user is now logged in" });
};

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(
      customApiError("provide required details", StatusCodes.BAD_REQUEST)
    );
  }

  const isFirstUser = (await User.countDocuments()) === 0;
  req.body.role = isFirstUser ? "admin" : "user";

  const user = await User.create(req.body);

  const token = await user.createToken();

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 3600 * 24*1000),
    secrue: process.env.NODE_ENV === "production",
  });

  res.status(StatusCodes.CREATED).json({ msg: "user is now registered" });
};

const logout = async (req, res, next) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
    secrue: process.env.NODE_ENV === "production",
  })

  res.send('logged out!')
};

export { login, register, logout };
