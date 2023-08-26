import joi from "joi";

const generateTransactionSchema = joi.object().keys({
  amount: joi.number().min(1).required(),
});

export { generateTransactionSchema };
