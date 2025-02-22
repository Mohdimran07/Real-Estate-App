import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import asyncHandler from "../middleware/asyncHandler.js";

const getPosts = asyncHandler(async (req, res) => {
  const query = req.query;
  // console.log(query);
  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || 0,
          lte: parseInt(query.maxPrice) || 1000000,
        },
      },
    });

    setTimeout(() => {
      res.status(200).json({
        error: false,
        message: "Fetched all posts",
        data: posts,
        query: query,
      });
    }, 3000);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Failed to get posts!" });
  }
});

const getPost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const post = await prisma.post.findUnique({
      where: { id: id },
      include: {
        PostDetail: true,
        user: {
          select: {
            name: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    const token = req.cookies?.jwt;
    let isSaved = false;
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECERET_KEY);
      console.log(payload)
      const saved = await prisma.savedPost.findUnique({
        where: {
          userId_postId: {
            userId: payload.id,
            postId: id,
          },
        },
      });

      isSaved = !!saved;
    }

    res.status(200).json({
      error: false,
      message: "Fetched post wt",
      data: post,
      isSaved,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Failed to get post!" });
  }
});

const createPost = asyncHandler(async (req, res) => {
  const body = req.body;
  console.log(body.postDetail);
  const tokenUserId = req.user;
  console.log(tokenUserId);
  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId.id,
        PostDetail: {
          create: body.postDetail,
        },
      },
    });
    res
      .status(201)
      .json({ error: false, message: "Post created", data: newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Failed to create post!" });
  }
});

const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.user;
  const body = req.body;
  try {
    const updatePost = await prisma.post.update({
      where: { id },
      body: {
        ...body,
        userId: tokenUserId.id,
      },
    });
    res
      .status(200)
      .json({ error: false, message: "Post updated", data: updatePost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Failed to update post!" });
  }
});

const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.user;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });
    if (post.userId !== tokenUserId.id) {
      return res.status(401).json({ message: "Unauthorized!!!" });
    }
    await prisma.post.delete({
      where: { id },
    });
    res.status(200).json({ error: false, message: "Post deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Failed to delete post!" });
  }
});

export { getPosts, getPost, createPost, updatePost, deletePost };
