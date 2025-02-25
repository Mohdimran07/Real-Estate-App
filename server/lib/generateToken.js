import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign(
    { id: userId, isAdmin: false },
    process.env.JWT_SECERET_KEY,
    { expiresIn: "1d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",  // only use in production-mode
    sameSite: "none", // Prevent CSRF attacks
   
  });

  return token;
};

export default generateToken;
