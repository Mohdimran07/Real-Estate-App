import express from "express";
import {
  createPost,
  getPosts,
  getPost,
  deletePost,
  updatePost,
} from "../controllers/postControllers.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.route("/").get(getPosts).post(authenticateToken, createPost);
router.route("/:id").get(getPost).delete(authenticateToken, deletePost).put(authenticateToken, updatePost);

export default router;
