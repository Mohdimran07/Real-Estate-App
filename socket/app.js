import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "https://real-estate-ui-ld3n.onrender.com",
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
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    io.to(receiver.socketId).emit("getMessage", data);
  });

  // Add typing event listeners
  socket.on("typing", ({ receiverId, isTyping }) => {
  
    const receiver = getUser(receiverId);

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
