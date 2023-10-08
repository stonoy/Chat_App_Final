import express from "express";
const router = express.Router();

import {getAllChats, createChat, getSingleChat,updateChat, deleteChat} from '../controllers/chat.js'

router.route('/').get(getAllChats).post(createChat)

router.route('/:id').get(getSingleChat).patch(updateChat).delete(deleteChat)

export default router