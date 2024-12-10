import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  topics: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      youtube_query: { type: String, required: true },
      video_id: { type: String, required: false },
      completed: { type: Boolean, default: false },
    },
  ],
  progress: { type: Number, default: 0 },
  thumbnail: { type: String, default: "" },

  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const CourseModel = mongoose.model("Course", courseSchema);
