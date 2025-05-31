"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Schema
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
});

export default function ForgetPasswordPreview() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    try {
      console.log("Submitted:", values);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Reset email error:", error);
      toast.error("Failed to send password reset email. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-10">
      <Card className="w-full max-w-md shadow-2xl p-6">
        <Link
          href="/login"
          className="mb-2 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Login</span>
        </Link>

        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-semibold">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-base">
            Enter your email address to receive a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 mt-2"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="me@example.com"
                        autoComplete="email"
                        aria-invalid={!!form.formState.errors.email}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
