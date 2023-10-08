import express from "express";
const router = express.Router();

import {
  getAllUser,
  getCurrentUser,
  getSingleUser,
  updateUser,
  deleteUser,
  changeName,
  removeblock,
  adminSpecial,
} from "../controllers/user.js";

import { authorization } from "../middlewares/Auth_Middleware.js";

router.get("/getalluser", getAllUser);
router.get("/getcurrentuser", getCurrentUser);
router.patch("/changename", changeName);
router.patch("/removeblock", removeblock);
router.get("/admin", authorization("admin"), adminSpecial);

router.route("/:id").get(getSingleUser).patch(updateUser).delete(deleteUser);

export default router;
