import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import postsRouter from "./routes/postRoutes.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import chatRouter from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3200;

// Cookie parser middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const LoggerMiddleware = (req, res, next) => {
  console.log(`Logged  ${req.url}  ${req.method} -- ${new Date()}`);
  next();
};

// application level middleware
app.use(LoggerMiddleware);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter)
app.use("/api/posts", postsRouter);
app.use("/api/messages", messageRouter);
app.use("/api/chats", chatRouter);

app.listen(PORT, () => console.log(`server is running @ localhost:${PORT}`));
