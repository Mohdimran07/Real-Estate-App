import prisma from "../lib/prisma.js";
import asyncHandler from "../middleware/asyncHandler.js";

const addMessage = asyncHandler(async (req, res) => {
  const userTokenId = req.user.id;

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: req.params.chatId,
        userIDs: {
          hasSome: [userTokenId],
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ error: true, message: "Chat not found!" });
    }

    const newMessage = await prisma.message.create({
      data: {
        chatId: req.params.chatId,
        userId: userTokenId,
        text: req.body.text,
      },
    });

    await prisma.chat.update({
      where: {
        id: req.params.chatId,
      },
      data: {
        lastMessage: newMessage.text,
        seenBy: [userTokenId],
      },
    });

    res
      .status(201)
      .json({ error: false, message: "Message sent!", data: newMessage });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Failed to send message!" });
  }
});

export { addMessage };
