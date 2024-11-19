import {Request, Response, NextFunction} from "express";
import {body, validationResult} from "express-validator";

const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }
  next();
};

export const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({min: 8}),
  handleValidation,
];

export const validateRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({min: 8})
    .matches(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z])/)
    .withMessage(
      "Password must contain 1 uppercase, lowercase, number and special character"
    ),
  body("username").trim().isLength({min: 3}),
  handleValidation,
];
