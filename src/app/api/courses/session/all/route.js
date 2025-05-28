import { connectDB } from "@/lib/connectDb";
import Session from "@/models/session/sessionModel";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const instructor = searchParams.get("instructor");
    const isPublic = searchParams.get("isPublic");
    const sortBy = searchParams.get("sortBy") || "sessionDate";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const search = searchParams.get("search");

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (instructor) filter.instructor = new RegExp(instructor, "i");
    if (isPublic !== null && isPublic !== undefined) {
      filter.isPublic = isPublic === "true";
    }
    if (search) {
      filter.$or = [
        { classTitle: new RegExp(search, "i") },
        { instructor: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get sessions with filters, pagination, and sorting
    const sessions = await Session.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalSessions = await Session.countDocuments(filter);
    const totalPages = Math.ceil(totalSessions / limit);

    // Calculate session statistics
    const stats = await Session.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          activeSessions: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          completedSessions: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledSessions: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          totalEnrolled: { $sum: "$enrolledCount" },
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Sessions retrieved successfully",
        data: {
          sessions,
          pagination: {
            currentPage: page,
            totalPages,
            totalSessions,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit,
          },
          stats: stats[0] || {
            totalSessions: 0,
            activeSessions: 0,
            completedSessions: 0,
            cancelledSessions: 0,
            totalEnrolled: 0,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving sessions:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve sessions. Please try again.",
      },
      { status: 500 }
    );
  }
}
