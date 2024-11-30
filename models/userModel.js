// Import dependencies
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

// Define User Schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    challengesParticipated: [
      {
        type: Schema.Types.ObjectId,
        ref: "Challenge",
      },
    ],
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    submissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Submission",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware to hash password before saving user to database
userSchema.pre("save", async function (next) {
  try {
    // If password is not modified, skip hashing
    if (!this.isModified("password")) return next();

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare hashed password with entered password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Model Export
const User = mongoose.model("User", userSchema);
export default User;
