import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
 
  const token = jwt.sign({ id: userId,
    isAdmin: false,
}, process.env.JWT_SECERET_KEY, {
    expiresIn: "1d",
  });
  
  res.cookie("jwt", token, {
    httpOnly: true,
    // secure: true, // only use in production-mode
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 3 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

export default generateToken;
