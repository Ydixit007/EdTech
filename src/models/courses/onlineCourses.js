import mongoose from "mongoose";

// Video schema for embedded videos within a course
const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
      maxlength: [200, "Video title cannot exceed 200 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
    },
    duration: {
      type: Number, // Duration in seconds (optional)
      min: 0,
    },
    order: {
      type: Number,
      default: 0, // For ordering videos within a course
    },
  },
  {
    timestamps: true,
  }
);

// Main course schema
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [200, "Course title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      maxlength: [2000, "Course description cannot exceed 2000 characters"],
    },
    thumbnail: {
      type: String,
      required: [true, "Course thumbnail is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Price must be a valid positive number",
      },
    },
    videos: [videoSchema], // Embedded array of videos

    // Additional useful fields
    isPublished: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      trim: true,
    },
    totalDuration: {
      type: Number, // Total course duration in seconds
      default: 0,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for better query performance
courseSchema.index({ title: "text", description: "text" }); // Text search
courseSchema.index({ price: 1 }); // Price sorting
courseSchema.index({ createdAt: -1 }); // Latest courses first
courseSchema.index({ isPublished: 1 }); // Filter published courses

// Virtual for video count
courseSchema.virtual("videoCount").get(function () {
  return this.videos.length;
});

// Pre-save middleware to calculate total duration
courseSchema.pre("save", function (next) {
  if (this.videos && this.videos.length > 0) {
    this.totalDuration = this.videos.reduce((total, video) => {
      return total + (video.duration || 0);
    }, 0);
  }
  next();
});

// Export the model
const OnlineCourses =
  mongoose.models.onlineCourses ||
  mongoose.model("onlineCourses", courseSchema);

export default OnlineCourses;
