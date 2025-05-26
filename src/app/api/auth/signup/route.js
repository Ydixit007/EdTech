import { connectDB } from "@/lib/connectDb";
import User from "@/models/user/userModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Connect to database
    await connectDB();

    // Extract data from request body
    const { firstName, lastName, email, password, role } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields. Please provide firstName, lastName, email, and password.",
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    // Validate role if provided
    const validRoles = ["student", "instructor", "admin"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid role. Role must be one of: student, instructor, admin.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Create new user
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "student", // Default to student if no role provided
    };

    const newUser = new User(userData);
    const savedUser = await newUser.save();

    // Generate auth token for the new user
    const authToken = await savedUser.generateAuthToken();

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    // Return success response with user data and token
    return NextResponse.json(
      {
        success: true,
        message: "User created successfully.",
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists.",
        },
        { status: 409 }
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
