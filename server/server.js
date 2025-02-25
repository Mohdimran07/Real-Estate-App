import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import authRouter from "./routes/authRoutes.js";
import postsRouter from "./routes/postRoutes.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import chatRouter from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8200;

const _dirname = path.resolve();

// Cookie parser middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "https://real-estate-ui-ld3n.onrender.com", credentials: true }));


const LoggerMiddleware = (req, res, next) => {
  console.log(`Logged  ${req.url}  ${req.method} -- ${new Date()}`);
  next();
};

// application level middleware
app.use(LoggerMiddleware);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/posts", postsRouter);
app.use("/api/messages", messageRouter);
app.use("/api/chats", chatRouter);

// app.use(express.static(path.join(_dirname, "/client/dist")));
// app.get("*", (_, res) => {
//   res.sendFile(path.resolve(_dirname, "client", "dist", "index.html"));
// });

app.listen(PORT, () => console.log(`server is running @ localhost:${PORT}`));
