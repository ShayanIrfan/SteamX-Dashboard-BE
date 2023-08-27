import joi from "joi";

const tokenReqSchema = joi.object().keys({
  token: joi.string().required(),
});

const emailReqSchema = joi.object().keys({
  email: joi
    .string()
    .required()
    .email({ tlds: { allow: false } }),
});

const passwordValidation = joi
  .string()
  .required()
  .min(8)
  .regex(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/)
  .messages({
    "string.pattern.base":
      "Your password must be at least 8 characters and contain uppercase and lowercase letters, numbers, and a special character.",
  });

const signInAdminSchema = emailReqSchema.keys({
  password: passwordValidation,
});

const resetPassSchema = tokenReqSchema.keys({
  newPass: passwordValidation,
});

export { signInAdminSchema, emailReqSchema, resetPassSchema };
