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
