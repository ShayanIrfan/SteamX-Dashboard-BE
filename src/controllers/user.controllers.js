// MongoDb Models
import { User } from "../models/User.js";
// import { Token } from "../../models/Token.js";

// utils
import { generateController } from "../utils/generateController.js";
import { generateAccessToken, generateAdminAccessToken } from "../utils/generateAccessToken.js";

//
// import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signIn = generateController(async (request, response, raiseException) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return raiseException(404, "User with this email doesn't exist");
  }

  // if (!user.verified) {
  //   return raiseException(403, "Please verify your account first");
  // }

  bcrypt.compare(password, user.password, async (err, result) => {
    if (err) {
      throw new Error("Auth failed");
    }

    if (!result) {
      return raiseException(403, "Invalid Password");
    }

    const token = user.isAdmin
      ? generateAdminAccessToken({
          userId: user._id,
          email: user.email,
          password: user.password,
        })
      : generateAccessToken({
          userId: user._id,
          email: user.email,
          password: user.password,
        });

    // const isToken = await Token.create({ user: user._id, token });

    // if (!isToken) {
    //   return raiseException(500, "Token creation failed");
    // }

    response.status(200).json({
      message: "User successfully signed in",
      payload: { user, token },
      success: true,
    });
  });
});

// const signInWithAuth = generateController(
//   async (request, _, raiseException) => {
//     const { email, password, oldToken } = request.user;

//     const user = await User.findOne({ email }).exec();

//     if (!user) {
//       return raiseException(404, "User with this email doesn't exist");
//     }

//     if (!user.verified) {
//       return raiseException(403, "Please verify your account first");
//     }

//     const token = generateAccessToken({
//       userId: user._id,
//       email,
//       password,
//     });

//     const isToken = await Token.updateOne(
//       { user: user._id, token: oldToken },
//       { $set: { user: user._id, token } }
//     ).exec();

//     if (!isToken) {
//       return raiseException(500, "Token creation failed");
//     }

//     return {
//       message: "User successfully signed in",
//       payload: { user, token },
//     };
//   }
// );

const signUp = generateController(async (request, response, raiseException) => {
  const { name, email, password } = request.body;

  const result = await User.findOne({ email }).exec();

  if (result) {
    return raiseException(405, "Mail already exists");
  }

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      return raiseException(500, err || "An error occurred while signing up");
    }

    try {
      const user = await User.create({
        name,
        email,
        password: hash,
      });

      const token = generateAccessToken({
        userId: user._id,
        email: user.email,
        password: user.password
      });

      response.status(201).json({
        message: "User successfully signed up",
        payload: { user, token },
        success: true,
      });
    } catch (err) {
      return raiseException(
        500,
        err.message || "An error occurred while signing up"
      );
    }
  });
});

// const signOut = generateController(async (request, _, raiseException) => {
//   const { token } = request.body;

//   const result = await Token.deleteOne({ token }).exec();

//   if (result.deletedCount <= 0) {
//     return raiseException(404, "SIGNOUT UNSUCCESSFUL: token not found");
//   }

//   return {
//     message: "User successfully signed out",
//   };
// });

const forgetPass = generateController(async (request, _, raiseException) => {
  const { email } = request.body;

  const user = await User.findOne({ email }).exec();
  if (!user) {
    return raiseException(404, "User with this email doesn't exist");
  }

  // if (!user.verified) {
  //   return raiseException(403, "Please verify your account first");
  // }

  const resetPassToken = jwt.sign(
    { userId: user._id },
    process.env.RESET_PASS_TOKEN_SECRET,
    { expiresIn: "20m" }
  );
  const message = {
    to: email,
    from: {
      email: "webners.blockchain@gmail.com",
      name: "Webners Blockchain",
    },
    subject: "Reset Password Link",
    html: `
        <h2>Click the link below to reset password</h2>
        <p>${process.env.CLIENT_URL}/resetpass/${resetPassToken}</p>
      `,
  };

  const sgMail = request.app.get("sgMail");
  const response = await sgMail.send(message);

  if (!response) {
    return raiseException(500, "Unable to make request for forget password");
  }

  return {
    message: "Email has been sent, kindly follow the instructions",
  };
});

const resetPass = generateController(
  async (request, response, raiseException) => {
    const { token, newPass } = request.body;

    if (!token) {
      return raiseException(404, "Token not found");
    }

    jwt.verify(token, process.env.RESET_PASS_TOKEN_SECRET, (error, user) => {
      if (error) {
        return raiseException(500, error || "Auth failed");
      }

      const { userId } = user;

      bcrypt.hash(newPass, 10, async (err, hash) => {
        if (err) {
          return raiseException(
            500,
            err || "An error occurred while resetting the password"
          );
        }

        try {
          const updateResult = await User.updateOne(
            { _id: userId },
            { $set: { password: hash } }
          ).exec();

          if (updateResult.modifiedCount <= 0) {
            return raiseException(500, "Reset operation failed");
          }

          response.status(201).json({
            message: "Your password has been changed",
            success: true,
          });
        } catch (err) {
          return raiseException(
            500,
            err.message || "An error occurred while resetting the password"
          );
        }
      });
    });
  }
);

export {
  signIn,
  // signInWithAuth,
  signUp,
  // signOut,
  forgetPass,
  resetPass,
};
