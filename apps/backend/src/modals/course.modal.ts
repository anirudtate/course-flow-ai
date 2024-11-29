import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    required: true,
    enum: ["beginner", "intermediate", "advanced"],
  },
  category: { type: String, required: true },
  topics: [{ type: String, required: true }],
  content: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      videoUrl: { type: String, required: true },
      duration: { type: Number, required: true }, // in minutes
      order: { type: Number, required: true },
    },
  ],
  createdBy: { type: String, required: true }, // Clerk userId
  progress: { type: Number, default: 0 },
  totalDuration: { type: Number, required: true }, // in minutes
  thumbnail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const CourseModel = mongoose.model("Course", courseSchema);
