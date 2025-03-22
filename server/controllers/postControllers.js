import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import asyncHandler from "../middleware/asyncHandler.js";

const getPosts = asyncHandler(async (req, res) => {
  const query = req.query;
  const page = parseInt(query.page) || 1; // Default to page 1
  const limit = parseInt(query.limit) || 10; // Default to 10 posts per page
  const skip = (page - 1) * limit;
  
  try {

    // Dynamically build the filter to exclude undefined values
    let whereClause = {};
    
    if (query.city) whereClause.city = query.city;
    if (query.type) whereClause.type = query.type;
    if (query.property) whereClause.property = query.property;
    if (query.bedroom) whereClause.bedroom = parseInt(query.bedroom);
    if (query.minPrice || query.maxPrice) {
      whereClause.price = {
        gte: query.minPrice ? parseInt(query.minPrice) : 0,
        lte: query.maxPrice ? parseInt(query.maxPrice) : 1000000,
      };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
    });
  
    const totalPosts = await prisma.post.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      error: false,
      message: "Fetched posts",
      data: posts,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalPosts,
        itemsPerPage: limit,
      },
      query: query,
    });
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
  const tokenUserId = req.user;

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
