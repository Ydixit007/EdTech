"use client";

import { useState } from "react";
import Joi from "joi";
import { signupSchema } from "@/common/validations";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signup } from "@/app/GetDataFromApi/api_calls/api_calls";

export const Signup1 = ({
  signupText = "Create an account",
  loginText = "Already have an account?",
  loginUrl = "/login",
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form data
      await signupSchema.validateAsync(formData, { abortEarly: false });
      setErrors({});
      setIsSubmitting(true);

      // Call the signup API
      const data = await signup(formData);

      toast.success("Account created successfully");

      // Simulate delay and reset form
      setTimeout(() => {
        setIsSubmitting(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
      }, 1500);
    } catch (err) {
      if (err.isJoi) {
        const formattedErrors = {};
        err.details.forEach((detail) => {
          formattedErrors[detail.path[0]] = detail.message;
        });
        setErrors(formattedErrors);
      } else {
        console.error("Signup error:", err);
        toast.error("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <section className="h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm px-6 py-10 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your details to create an account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="bg-white"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="bg-white"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>

            <div>
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="bg-white"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="bg-white"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer"
            >
              {isSubmitting ? "Signing up..." : signupText}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
              {loginText}{" "}
              <a
                href={loginUrl}
                className="text-primary font-medium hover:underline cursor-pointer"
              >
                Login
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
