import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDb";
import OnlineCourses from "@/models/courses/onlineCourses";

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    const { title, description, thumbnail, price, videos } = body;

    if (!title || !description || !thumbnail || price === undefined) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: title, description, thumbnail, and price are required",
        },
        { status: 400 }
      );
    }

    // Validate price
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Price must be a positive number",
        },
        { status: 400 }
      );
    }

    // Validate videos array if provided
    if (videos && Array.isArray(videos)) {
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (!video.title || !video.videoUrl) {
          return NextResponse.json(
            {
              success: false,
              error: `Video at index ${i} is missing required fields: title and videoUrl`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Create course data object
    const courseData = {
      title: title.trim(),
      description: description.trim(),
      thumbnail: thumbnail.trim(),
      price: parseFloat(price),
      videos: videos || [],
      category: body.category?.trim() || "",
      isPublished: body.isPublished || false,
    };

    // Create new course
    const course = new OnlineCourses(courseData);
    await course.save();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully",
        data: {
          id: course._id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          price: course.price,
          videoCount: course.videoCount,
          totalDuration: course.totalDuration,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "Course with this title already exists",
        },
        { status: 409 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
