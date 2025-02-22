import bcrypt from "bcryptjs";

import asyncHandler from "../middleware/asyncHandler.js";
import prisma from "../lib/prisma.js";
import generateToken from "../lib/generateToken.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the feilds");
  }
  // check if the user exist in the DB
  const userExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userExist) {
    res.status(400).json({ error: true, message: "User already exist" });
  } else {
    // hash the password
    const hassedPassword = await bcrypt.hash(password, 10);
    // create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hassedPassword,
      },
    });

    if (newUser) {
      generateToken(res, newUser._id),
        res.status(201).json({
          error: false,
          msg: "User Create Successfuly",
          data: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
          },
        });
    } else {
      res.status(500).json({ error: true, message: "Failed to create user" });
    }
  }
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //check email in db
  const checkUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!checkUser) {
    res.status(401).json({ error: true, message: "Invalid Credentials!" });
  }

  // check if the password is correct
  const isPasswordValid = await bcrypt.compare(password, checkUser.password);

  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ error: true, message: "Invalid Credentials!!" });
  }
  const {password: checkUserPassword, ...data} = checkUser;
  const token = generateToken(res, checkUser.id)
  // Set JWT as an HTTP-Only cookie
  res.status(200).json({
    error: false,
    message: "Login Success!",
    data
  
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  res
    .clearCookie("jwt")
    .status(200)
    .json({ error: false, message: "Logout Successful" });
});

export { registerUser, loginUser, logoutUser };
