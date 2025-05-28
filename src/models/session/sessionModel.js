import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    classTitle: {
      type: String,
      required: [true, "Class title is required"],
      trim: true,
      maxlength: [200, "Class title cannot exceed 200 characters"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
      trim: true,
    },
    sessionDate: {
      type: Date,
      required: [true, "Session date is required"],
      validate: {
        validator: function (value) {
          return value >= new Date().setHours(0, 0, 0, 0);
        },
        message: "Session date cannot be in the past",
      },
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please enter a valid time format (HH:MM)",
      ],
    },
    meetingLink: {
      type: String,
      required: [true, "Meeting link is required"],
      trim: true,
      validate: {
        validator: function (value) {
          // Validate Zoom or Google Meet URLs
          const zoomRegex = /^https:\/\/[\w-]*\.?zoom\.us\/(j|my)\/[\w?=-]+/;
          const meetRegex = /^https:\/\/meet\.google\.com\/[\w-]+/;
          return zoomRegex.test(value) || meetRegex.test(value);
        },
        message: "Please enter a valid Zoom or Google Meet link",
      },
    },

    // Additional useful fields
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    duration: {
      type: Number, // Duration in minutes
      default: 60,
      min: [15, "Session duration must be at least 15 minutes"],
      max: [480, "Session duration cannot exceed 8 hours"],
    },
    instructor: {
      type: String,
      required: [true, "Instructor name is required"],
      trim: true,
      maxlength: [100, "Instructor name cannot exceed 100 characters"],
    },
    maxParticipants: {
      type: Number,
      default: 50,
      min: [1, "Must allow at least 1 participant"],
      max: [1000, "Cannot exceed 1000 participants"],
    },
    enrolledParticipants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for better query performance
sessionSchema.index({ sessionDate: 1, startTime: 1 }); // Query by date and time
sessionSchema.index({ instructor: 1 }); // Query by instructor name
sessionSchema.index({ status: 1 }); // Filter by status
sessionSchema.index({ classTitle: "text", description: "text" }); // Text search

// Virtual for enrolled count
sessionSchema.virtual("enrolledCount").get(function () {
  return this.enrolledParticipants.length;
});

// Virtual for available spots
sessionSchema.virtual("availableSpots").get(function () {
  return this.maxParticipants - this.enrolledParticipants.length;
});

// Virtual for full date-time
sessionSchema.virtual("fullDateTime").get(function () {
  const dateStr = this.sessionDate.toISOString().split("T")[0];
  return new Date(`${dateStr}T${this.startTime}:00`);
});

// Instance method to enroll a participant
sessionSchema.methods.enrollParticipant = async function (userId) {
  const session = this;

  // Check if already enrolled
  const alreadyEnrolled = session.enrolledParticipants.some(
    (participant) => participant.userId.toString() === userId.toString()
  );

  if (alreadyEnrolled) {
    throw new Error("User is already enrolled in this session");
  }

  // Check if session is full
  if (session.enrolledParticipants.length >= session.maxParticipants) {
    throw new Error("Session is full");
  }

  // Check if session is in the past
  if (session.fullDateTime < new Date()) {
    throw new Error("Cannot enroll in past sessions");
  }

  session.enrolledParticipants.push({ userId });
  await session.save();

  return session;
};

// Instance method to remove a participant
sessionSchema.methods.removeParticipant = async function (userId) {
  const session = this;

  session.enrolledParticipants = session.enrolledParticipants.filter(
    (participant) => participant.userId.toString() !== userId.toString()
  );

  await session.save();
  return session;
};

// Instance method to check if user is enrolled
sessionSchema.methods.isUserEnrolled = function (userId) {
  return this.enrolledParticipants.some(
    (participant) => participant.userId.toString() === userId.toString()
  );
};

// Static method to find upcoming sessions
sessionSchema.statics.findUpcomingSessions = function (limit = 10) {
  const now = new Date();
  return this.find({
    sessionDate: { $gte: now },
    status: "scheduled",
    isPublic: true,
  })
    .sort({ sessionDate: 1, startTime: 1 })
    .limit(limit);
};

// Static method to find sessions by instructor name
sessionSchema.statics.findByInstructor = function (instructorName) {
  return this.find({
    instructor: { $regex: instructorName, $options: "i" },
  }).sort({ sessionDate: -1 });
};

// Pre-save middleware to update status based on date/time
sessionSchema.pre("save", function (next) {
  const now = new Date();
  const sessionDateTime = this.fullDateTime;
  const sessionEndTime = new Date(
    sessionDateTime.getTime() + this.duration * 60000
  );

  if (this.status === "scheduled") {
    if (now >= sessionDateTime && now <= sessionEndTime) {
      this.status = "ongoing";
    } else if (now > sessionEndTime) {
      this.status = "completed";
    }
  }

  next();
});

const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
