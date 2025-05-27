import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDb";
import OnlineCourses from "@/models/courses/onlineCourses";

export async function GET(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const category = searchParams.get("category");
    const isPublished = searchParams.get("isPublished");
    const search = searchParams.get("search");

    // Build filter object
    const filter = {};

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    if (isPublished !== null && isPublished !== undefined) {
      filter.isPublished = isPublished === "true";
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get courses with pagination
    const courses = await OnlineCourses.find(filter)
      .select("-videos.videoUrl") // Exclude video URLs for security/performance
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCourses = await OnlineCourses.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / limit);

    // Format response data
    // const formattedCourses = courses.map((course) => ({
    //   id: course._id,
    //   title: course.title,
    //   description: course.description,
    //   thumbnail: course.thumbnail,
    //   price: course.price,
    //   category: course.category,
    //   videoCount: course.videoCount,
    //   totalDuration: course.totalDuration,
    //   isPublished: course.isPublished,
    //   createdAt: course.createdAt,
    //   updatedAt: course.updatedAt,
    // }));

    return NextResponse.json(
      {
        success: true,
        data: courses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCourses,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching courses:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
