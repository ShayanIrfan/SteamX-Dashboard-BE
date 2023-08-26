import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.USER_TOKEN_SECRET, { expiresIn: "28d" });
};

export const generateAdminAccessToken = (user) => {
  return jwt.sign(user, process.env.ADMIN_TOKEN_SECRET, { expiresIn: "28d" });
};
