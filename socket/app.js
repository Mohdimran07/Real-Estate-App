import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "https://real-estate-ui-ld3n.onrender.com ",
  },
});

let onlineUsers = [];

const addUsers = (userId, socketId) => {
  const userExists = onlineUsers.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("newUser", (userId) => {
    addUsers(userId, socket.id);
    console.log(onlineUsers);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    console.log(receiverId);
    const receiver = getUser(receiverId);
    console.log(receiver);
    io.to(receiver.socketId).emit("getMessage", data);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen("4000");
