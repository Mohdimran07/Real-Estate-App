import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import prisma from "../lib/prisma.js";

const authenticateToken = asyncHandler(async (req, res, next) => {

  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: true, message: "Unauthorized" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECERET_KEY);

  req.user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });
  console.log("token verified!!");
  next();
});

export default authenticateToken;
