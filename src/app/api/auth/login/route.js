import { connectDB } from "@/lib/connectDb";
import User from "@/models/user/userModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Connect to database
    await connectDB();

    // Extract data from request body
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    // Find user by email and include password field
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Generate auth token
    const authToken = await user.generateAuthToken();

    // Get user data without sensitive fields
    const userResponse = user.toJSON();

    // Return success response with user data and token
    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: userResponse,
        token: authToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input data.",
        },
        { status: 400 }
      );
    }

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        {
          success: false,
          message: "Token generation failed.",
        },
        { status: 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
