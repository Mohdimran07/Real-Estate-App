import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:3200",
  },
});

let onlineUsers = [];
const socketIdToUserId = {};

const addUsers = (userId, socketId) => {
  const userExists = onlineUsers.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUsers.push({ userId, socketId });
    socketIdToUserId[socketId] = userId; 
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  delete socketIdToUserId[socketId];
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUsers(userId, socket.id);
    console.log("onlineUsers", onlineUsers);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    io.to(receiver.socketId).emit("getMessage", data);
  });

  // Add typing event listeners
  socket.on("typing", ({ receiverId, isTyping }) => {
    console.log("typing!!!", receiverId)
    const receiver = getUser(receiverId);
    console.log(receiver)
    if (receiver) {
      io.to(receiver.socketId).emit("typing", {
        isTyping,
        senderId: socket.id,
      });
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen("4000");
