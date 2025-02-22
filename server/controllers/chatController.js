import prisma from "../lib/prisma.js";
import asyncHandler from "../middleware/asyncHandler.js";

const getChats = asyncHandler(async (req, res) => {
  const userTokenId = req.user.id;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [userTokenId],
        },
      },
    });

    for (const chat of chats) {
      const otherUserId = chat.userIDs.find((id) => id !== userTokenId);
      const user = await prisma.user.findUnique({
        where: {
          id: otherUserId,
        },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      });
      chat.user = user;
    }
    res.status(200).json({ error: false, data: chats });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Failed to get chats!" });
  }
});
const createChat = asyncHandler(async (req, res) => {
  const userTokenId = req.user.id;

  try {
    const newChat = await prisma.chat.create({
      data: {
        userIDs: {
          set: [userTokenId, req.body.receiverId],
        },
      },
    });

    res
      .status(201)
      .json({ error: false, message: "Chat created!", data: newChat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Failed to get chat!" });
  }
});
const getChat = asyncHandler(async (req, res) => {
  const userTokenId = req.user.id;
  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [userTokenId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    await prisma.chat.update({
      where: {
        id: req.params.id,
      },

      data: {
        seenBy: {
          push: [userTokenId],
        },
      },
    });
    res.status(200).json({ error: false, data: chat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Failed to add chat!" });
  }
});
const readChat = asyncHandler(async (req, res) => {
  const userTokenId = req.user.id;
  try {
    const chat = await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: {
          push: [userTokenId],
        },
      },
    });
    res.status(200).json({ error: false, data: chat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Failed to read chat!" });
  }
});

export { getChats, getChat, createChat, readChat };
