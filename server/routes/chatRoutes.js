import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';

import { getChats, getChat, createChat, readChat } from '../controllers/chatController.js';

const router = express.Router();

router.get('/', authenticateToken, getChats);
router.get('/:id', authenticateToken, getChat);
router.post('/', authenticateToken, createChat);
router.put('/read/:id', authenticateToken, readChat);

export default router;