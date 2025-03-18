import express from "express";
import {
  deleteUser,
  getUsers,
  getUserProfile,
  updateUser,
  savePost,
  profilePosts,
  getNotifications,
} from "../controllers/userControllers.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/save", authenticateToken, savePost);

router.get("/profilePosts", authenticateToken, profilePosts);

router
  .route("/:id")
  // .get(authenticateToken, getUserProfile)
  .put(authenticateToken, updateUser)
  .delete(authenticateToken, deleteUser);

router.get("/notifications", authenticateToken, getNotifications);

export default router;
