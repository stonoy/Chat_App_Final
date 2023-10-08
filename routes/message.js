import express from 'express'
const router = express.Router()

import {getAllMessages, createMessage, deleteMessage} from '../controllers/message.js'

router.route('/').get(getAllMessages).post(createMessage)

router.route('/:id').delete(deleteMessage)

export default router