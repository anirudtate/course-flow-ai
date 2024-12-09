import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    required: true,
    enum: ["beginner", "intermediate", "advanced"],
  },
  topics: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      order: { type: Number, required: true },
    },
  ],
  createdBy: { type: String, required: true }, // Clerk userId
  progress: { type: Number, default: 0 },
  totalDuration: { type: Number, required: true }, // in minutes
  thumbnail: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const CourseModel = mongoose.model("Course", courseSchema);
