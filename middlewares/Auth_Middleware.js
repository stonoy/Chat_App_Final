import { StatusCodes } from "http-status-codes";
import customApiError from "../errors/cutomError.js";
import jwt from "jsonwebtoken";

const authentication = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(customApiError("provide a token", StatusCodes.UNAUTHORIZED));
  }
  try {
    const { userId, role } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId, role };
    next();
  } catch (error) {
    return next(
      customApiError("provide a valid token", StatusCodes.UNAUTHORIZED)
    );
  }
};

export const authorization = (...rest) => {
  return (req, res, next) => {
    if (!rest.includes(req.user.role)) {
      return next(
        customApiError("Not authroized for the route!", StatusCodes.FORBIDDEN)
      );
    }

    next();
  };
};

export default authentication;
