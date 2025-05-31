"use client";
import React, { useState } from "react";
import Joi from "joi";
import { loginSchema } from "@/common/validations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import showToast from "react-hot-toast";
// import toast from "react-hot-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/GetDataFromApi/api_calls/api_calls";

export function LoginForm({ className, ...props }) {
  const [formData, setFormData] = useState({ email: "", password: "" });

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
      await loginSchema.validateAsync(formData, { abortEarly: false });
      setErrors({});
      setIsSubmitting(true);

      const data = await login(formData);

      // Simulate login success
      setTimeout(() => {
        setIsSubmitting(false);
        showToast.success("Logged in successfully!");
        // Optionally redirect or reset form
      }, 1500);
    } catch (err) {
      const validationErrors = {};
      if (err.details) {
        err.details.forEach((detail) => {
          validationErrors[detail.path[0]] = detail.message;
        });
        setErrors(validationErrors);
      } else {
        showToast.error("Login failed ");
        console.error("Login error:", err);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        className
      )}
      {...props}
    >
      <Card className="w-full max-w-md shadow-2xl">
        {" "}
        {/* Reduced width + box shadow */}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {" "}
            {/* Larger heading */}
            Login
          </CardTitle>
          <CardDescription className=" text-muted-foreground mt-1">
            {" "}
            {/* More impactful description */}
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="m@example.com"
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={cn(errors.password && "border-red-500")}
              />

              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              <div className="flex items-center">
                <a
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Don't have an account?{"  "}
                <a
                  href={"/signup"}
                  className="text-primary font-medium hover:underline cursor-pointer"
                >
                  Sign Up
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
