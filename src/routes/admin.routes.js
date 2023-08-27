import express from "express";
import { validateBody } from "../middlewares/validateBody.js";
import {
  emailReqSchema,
  resetPassSchema,
  signInAdminSchema,
} from "../schemaValidation/admin.schema.js";
import {
  signIn,
  // signInWithAuth,
  // signOut,
  forgetPass,
  resetPass,
} from "../controllers/admin.controllers.js";

const router = express.Router();

router.post("/sign-in", validateBody(signInAdminSchema), signIn);
// router.put("/sign-in-with-auth", adminAuth, signInWithAuth);
// router.delete("/sign-out", validateBody(tokenReqSchema), signOut);
router.post("/forget-pass", validateBody(emailReqSchema), forgetPass);
router.patch("/reset-pass", validateBody(resetPassSchema), resetPass);

export default router;
