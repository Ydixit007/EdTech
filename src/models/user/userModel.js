import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
      required: [true, "Role is required"],
    },
    token: {
      type: String,
    },
    myCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "onlineCourses",
          required: true,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        completedVideos: [
          {
            videoId: {
              type: mongoose.Schema.Types.ObjectId,
              required: true,
            },
            completedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
    mySessions: [
      {
        sessionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Session",
          required: true,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        attended: {
          type: Boolean,
          default: false,
        },
        attendedAt: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to generate auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "defaultJWTSecret",
    { expiresIn: "7d" } // Add token expiration
  );

  // Store token in user document
  user.token = token;
  await user.save();

  return token;
};

// Instance method to remove auth token (for logout)
userSchema.methods.removeAuthToken = async function () {
  const user = this;
  user.token = null;
  await user.save();
};

// Instance method to remove all auth tokens (for logout from all devices)
userSchema.methods.removeAllAuthTokens = async function () {
  const user = this;
  user.token = null;
  await user.save();
};

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get full name
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Instance method to add course to user's purchased courses
userSchema.methods.addCourse = async function (courseId) {
  const user = this;
  const courseExists = user.myCourses.some(
    (course) => course.courseId.toString() === courseId.toString()
  );

  if (!courseExists) {
    user.myCourses.push({ courseId });
    await user.save();
  }

  return user;
};

// Instance method to mark course as completed
userSchema.methods.markCourseCompleted = async function (courseId) {
  const user = this;
  const course = user.myCourses.find(
    (course) => course.courseId.toString() === courseId.toString()
  );

  if (course) {
    course.isCompleted = true;
    await user.save();
  }

  return user;
};

// Instance method to mark video as completed
userSchema.methods.markVideoCompleted = async function (courseId, videoId) {
  const user = this;
  const course = user.myCourses.find(
    (course) => course.courseId.toString() === courseId.toString()
  );

  if (course) {
    const videoExists = course.completedVideos.some(
      (video) => video.videoId.toString() === videoId.toString()
    );

    if (!videoExists) {
      course.completedVideos.push({ videoId });
      await user.save();
    }
  }

  return user;
};

// Instance method to check if video is completed
userSchema.methods.isVideoCompleted = function (courseId, videoId) {
  const course = this.myCourses.find(
    (course) => course.courseId.toString() === courseId.toString()
  );

  if (!course) return false;

  return course.completedVideos.some(
    (video) => video.videoId.toString() === videoId.toString()
  );
};

// Instance method to get course progress
userSchema.methods.getCourseProgress = function (courseId, totalVideos) {
  const course = this.myCourses.find(
    (course) => course.courseId.toString() === courseId.toString()
  );

  if (!course) return 0;

  const completedCount = course.completedVideos.length;
  return totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;
};

// Instance method to add session to user's enrolled sessions
userSchema.methods.addSession = async function (sessionId) {
  const user = this;
  const sessionExists = user.mySessions.some(
    (session) => session.sessionId.toString() === sessionId.toString()
  );

  if (!sessionExists) {
    user.mySessions.push({ sessionId });
    await user.save();
  }

  return user;
};

// Instance method to mark session as attended
userSchema.methods.markSessionAttended = async function (sessionId) {
  const user = this;
  const session = user.mySessions.find(
    (session) => session.sessionId.toString() === sessionId.toString()
  );

  if (session) {
    session.attended = true;
    session.attendedAt = new Date();
    await user.save();
  }

  return user;
};

// Instance method to check if user is enrolled in a session
userSchema.methods.hasSession = function (sessionId) {
  return this.mySessions.some(
    (session) => session.sessionId.toString() === sessionId.toString()
  );
};

// Instance method to check if user attended a session
userSchema.methods.hasAttendedSession = function (sessionId) {
  const session = this.mySessions.find(
    (session) => session.sessionId.toString() === sessionId.toString()
  );

  return session ? session.attended : false;
};

// Instance method to get upcoming sessions
userSchema.methods.getUpcomingSessions = function () {
  const now = new Date();
  return this.mySessions.filter((session) => {
    // This would need to be populated to check session date
    // For now, just return all enrolled sessions
    return true;
  });
};

// Instance method to check if user has purchased a course
userSchema.methods.hasCourse = function (courseId) {
  return this.myCourses.some(
    (course) => course.courseId.toString() === courseId.toString()
  );
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by token
userSchema.statics.findByToken = async function (token) {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultJWTSecret");
  } catch (error) {
    return null;
  }

  const user = await User.findOne({
    _id: decoded._id,
    token: token,
  });

  return user;
};

// Transform output to remove password, token and __v
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.token;
  delete user.__v;
  return user;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
