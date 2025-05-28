import { connectDB } from "@/lib/connectDb";
import Session from "@/models/session/sessionModel";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

export async function PUT(request, { params }) {
  try {
    // Connect to database
    await connectDB();

    // Validate session ID
    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid session ID",
        },
        { status: 400 }
      );
    }

    // Check if session exists
    const existingSession = await Session.findById(id);
    if (!existingSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found",
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Extract fields from request body
    const {
      classTitle,
      thumbnail,
      sessionDate,
      startTime,
      meetingLink,
      instructor,
      description,
      duration,
      maxParticipants,
      isPublic,
      status,
    } = body;

    // Create update object with only provided fields
    const updateData = {};

    if (classTitle !== undefined) updateData.classTitle = classTitle.trim();
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail.trim();
    if (sessionDate !== undefined)
      updateData.sessionDate = new Date(sessionDate);
    if (startTime !== undefined) updateData.startTime = startTime.trim();
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink.trim();
    if (instructor !== undefined) updateData.instructor = instructor.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (maxParticipants !== undefined)
      updateData.maxParticipants = parseInt(maxParticipants);
    if (typeof isPublic === "boolean") updateData.isPublic = isPublic;
    if (status !== undefined) updateData.status = status;

    // Validate session date is not in the past (if being updated)
    if (sessionDate && startTime) {
      const sessionDateTime = new Date(`${sessionDate}T${startTime}:00`);
      const now = new Date();

      if (sessionDateTime <= now) {
        return NextResponse.json(
          {
            success: false,
            message: "Session date and time must be in the future",
          },
          { status: 400 }
        );
      }
    }

    // Validate meeting link format (if being updated)
    if (meetingLink) {
      const zoomRegex = /^https:\/\/[\w-]*\.?zoom\.us\/(j|my)\/[\w?=-]+/;
      const meetRegex = /^https:\/\/meet\.google\.com\/[\w-]+/;

      if (!zoomRegex.test(meetingLink) && !meetRegex.test(meetingLink)) {
        return NextResponse.json(
          {
            success: false,
            message: "Please provide a valid Zoom or Google Meet link",
          },
          { status: 400 }
        );
      }
    }

    // Update the session
    const updatedSession = await Session.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Session updated successfully",
        data: {
          sessionId: updatedSession._id,
          classTitle: updatedSession.classTitle,
          sessionDate: updatedSession.sessionDate,
          startTime: updatedSession.startTime,
          instructor: updatedSession.instructor,
          status: updatedSession.status,
          enrolledCount: updatedSession.enrolledCount,
          availableSpots: updatedSession.availableSpots,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating session:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A session with similar details already exists",
        },
        { status: 409 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update session. Please try again.",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id]/route.js - Delete Session
export async function DELETE(request, { params }) {
  try {
    // Connect to database
    await connectDB();

    // Validate session ID
    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid session ID",
        },
        { status: 400 }
      );
    }

    // Find and delete the session
    const deletedSession = await Session.findByIdAndDelete(id);

    if (!deletedSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Session deleted successfully",
        data: {
          sessionId: deletedSession._id,
          classTitle: deletedSession.classTitle,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting session:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete session. Please try again.",
      },
      { status: 500 }
    );
  }
}

// GET /api/sessions/[id]/route.js - Get Single Session
export async function GET(request, { params }) {
  try {
    // Connect to database
    await connectDB();

    // Validate session ID
    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid session ID",
        },
        { status: 400 }
      );
    }

    // Find the session
    const session = await Session.findById(id);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Session retrieved successfully",
        data: session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving session:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve session. Please try again.",
      },
      { status: 500 }
    );
  }
}
