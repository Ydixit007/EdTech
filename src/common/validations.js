import Joi from "joi";
import { z } from "zod";

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Enter a valid email",
    }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const signupSchema = Joi.object({
  firstName: Joi.string().min(2).required().messages({
    "string.empty": "First Name is required",
    "string.min": "First Name must be at least 2 characters",
  }),

  lastName: Joi.string().min(2).required().messages({
    "string.empty": "Last Name is required",
    "string.min": "Last Name must be at least 2 characters",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Enter a valid email",
    }),

  password: Joi.string().pattern(passwordPattern).required().messages({
    "string.empty": "Password is required",
    "string.pattern.base":
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character, and be at least 8 characters long",
  }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string({
      required_error: "Please confirm your password",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
