import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import asyncHandler from "../middleware/asyncHandler.js";

const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({ error: false, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Failed to get users!" });
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    res.status(200).json({ error: false, data: user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: true, message: "Failed to get user profile!" });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.user;
  const { password, avatar, ...inputs } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (id !== tokenUserId.id) {
    return res.status(401).json({ message: "Unauthorized!!!" });
  }

  let updatedPassword = null;

  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    res.status(200).json({
      error: false,
      message: "User updated Successfully!",
      updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Failed to update user!" });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  try {
    await prisma.user.delete({
      where: {
        id: id,
      },
    });
    res
      .status(200)
      .json({ error: false, message: "User deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Failed to delete user!" });
  }
});

const savePost = asyncHandler(async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.user.id;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });
    console.log("saved post:", savedPost);
    if (savedPost) {
      await prisma.savedPost.delete({
        where: { id: savedPost.id },
      });
      res.status(200).json({ message: "Post removed from saved list!" });
    } else {
      console.log({
        userId: tokenUserId,
        postId,
      });
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved list!" });
    }
  } catch (error) {
    console.log(error);
  }
});

const profilePosts = asyncHandler(async (req, res) => {
  const userTokenId = req.user.id;

  try {
    const [userPosts, savedPosts] = await Promise.all([
      prisma.post.findMany({
        where: { userId: userTokenId },
      }),
      prisma.savedPost.findMany({
        where: { userId: userTokenId },
        include: {
          post: true,
        },
      }),
    ]);

    // Extract saved posts from savedPosts
    const savedPost = savedPosts.map(({ post }) => post);

    res.status(200).json({
      error: false,
      data: userPosts,
      saved: savedPost,
      message: "Fetched all user posts!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: true,
      message: "An error occurred while fetching posts.",
      details: err.message,
    });
  }
});
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log("userTokenId", userId);
  // // Validate userId
  // if (!userId || !ObjectId.isValid(userId)) {
  //   console.error("Invalid userId:", userId);
  //   return res.status(400).json({ error: true, message: "Invalid user ID!" });
  // }

  try {
    const notifications = await prisma.chat.count({
      where: {
        userIDs: {
          hasSome: [userId],
        },
        NOT: {
          seenBy: {
            hasSome: [userId],
          },
        },
      },
    });
    console.log(notifications);
    res.status(200).json({ error: false, data: notifications });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: true, message: "Failed to get notifications!" });
  }
});

export {
  getUsers,
  getUserProfile,
  updateUser,
  deleteUser,
  savePost,
  profilePosts,
  getNotifications,
};
