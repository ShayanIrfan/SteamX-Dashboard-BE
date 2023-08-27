import jwt from "jsonwebtoken";

export const generateAdminAccessToken = (admin) => {
  return jwt.sign(admin, process.env.ADMIN_TOKEN_SECRET, { expiresIn: "28d" });
};
