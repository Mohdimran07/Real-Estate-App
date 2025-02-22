import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import { addMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/:chatId", authenticateToken, addMessage);

export default router;
