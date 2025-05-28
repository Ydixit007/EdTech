import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDb";
import OnlineCourses from "@/models/courses/onlineCourses";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    // Connect to MongoDB
    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid course ID format",
        },
        { status: 400 }
      );
    }

    // Find course by ID
    const course = await OnlineCourses.findById(id)
      .select("-videos.videoUrl")
      .lean();

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }

    // Format response data
    const formattedCourse = {
      id: course._id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      category: course.category,
      videos: course.videos.map((video, index) => ({
        id: video._id,
        title: video.title,
        description: video.description || "",
        duration: video.duration || 0,
        order: video.order || index + 1,
        // Only include videoUrl if user has access (you might want to add authentication here)
        videoUrl: video.videoUrl,
      })),
      videoCount: course.videoCount,
      totalDuration: course.totalDuration,
      isPublished: course.isPublished,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedCourse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching course:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Connect to MongoDB
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid course ID format",
        },
        { status: 400 }
      );
    }

    // Check if course exists
    const existingCourse = await OnlineCourses.findById(id);
    if (!existingCourse) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }

    // Extract and validate fields
    const {
      title,
      description,
      thumbnail,
      price,
      videos,
      category,
      isPublished,
    } = body;

    // Validate price if provided
    if (price !== undefined && (typeof price !== "number" || price < 0)) {
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

    // Build update object with only provided fields
    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail.trim();
    if (price !== undefined) updateData.price = parseFloat(price);
    if (videos !== undefined) updateData.videos = videos;
    if (category !== undefined) updateData.category = category.trim();
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // Update the course
    const updatedCourse = await OnlineCourses.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validations
      }
    );

    // Format response data
    const formattedCourse = {
      id: updatedCourse._id,
      title: updatedCourse.title,
      description: updatedCourse.description,
      thumbnail: updatedCourse.thumbnail,
      price: updatedCourse.price,
      category: updatedCourse.category,
      videoCount: updatedCourse.videoCount,
      totalDuration: updatedCourse.totalDuration,
      isPublished: updatedCourse.isPublished,
      createdAt: updatedCourse.createdAt,
      updatedAt: updatedCourse.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Course updated successfully",
        data: formattedCourse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating course:", error);

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

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Connect to MongoDB
    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid course ID format",
        },
        { status: 400 }
      );
    }

    // Find and delete the course
    const deletedCourse = await OnlineCourses.findByIdAndDelete(id);

    if (!deletedCourse) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Course deleted successfully",
        data: {
          id: deletedCourse._id,
          title: deletedCourse.title,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
