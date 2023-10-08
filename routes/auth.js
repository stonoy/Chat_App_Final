import express from "express";
const router = express.Router();

import { login, register, logout } from "../controllers/auth.js";
import rateLimiter from "express-rate-limit";

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { msg: "IP rate limit exceeded, retry in 15 minutes." },
});

router.post("/login", apiLimiter, login);
router.post("/register", apiLimiter, register);
router.get("/logout", logout);

export default router;
