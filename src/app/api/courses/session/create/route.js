import { connectDB } from "@/lib/connectDb";
import Session from "@/models/session/sessionModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Connect to database
    await connectDB();

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
    } = body;

    // Validate required fields
    if (
      !classTitle ||
      !thumbnail ||
      !sessionDate ||
      !startTime ||
      !meetingLink ||
      !instructor
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: classTitle, thumbnail, sessionDate, startTime, meetingLink, instructor",
        },
        { status: 400 }
      );
    }

    // Validate session date is not in the past
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

    // Validate meeting link format
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

    // Create new session object
    const sessionData = {
      classTitle: classTitle.trim(),
      thumbnail: thumbnail.trim(),
      sessionDate: new Date(sessionDate),
      startTime: startTime.trim(),
      meetingLink: meetingLink.trim(),
      instructor: instructor.trim(),
    };

    // Add optional fields if provided
    if (description) sessionData.description = description.trim();
    if (duration) sessionData.duration = parseInt(duration);
    if (maxParticipants)
      sessionData.maxParticipants = parseInt(maxParticipants);
    if (typeof isPublic === "boolean") sessionData.isPublic = isPublic;

    // Create and save the session
    const newSession = new Session(sessionData);
    const savedSession = await newSession.save();

    return NextResponse.json(
      {
        success: true,
        message: "Session created successfully",
        data: {
          sessionId: savedSession._id,
          classTitle: savedSession.classTitle,
          sessionDate: savedSession.sessionDate,
          startTime: savedSession.startTime,
          instructor: savedSession.instructor,
          status: savedSession.status,
          enrolledCount: savedSession.enrolledCount,
          availableSpots: savedSession.availableSpots,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating session:", error);

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
        message: "Failed to create session. Please try again.",
      },
      { status: 500 }
    );
  }
}
