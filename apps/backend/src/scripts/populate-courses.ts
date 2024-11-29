import mongoose from "mongoose";
import dotenv from "dotenv";
import { CourseModel } from "../modals/course.modal";

dotenv.config();

const courses = [
  {
    title: "Introduction to AI",
    description: "Learn the fundamentals of Artificial Intelligence",
    difficulty: "beginner",
    category: "Artificial Intelligence",
    topics: ["AI Basics", "Machine Learning", "Neural Networks"],
    content: [
      {
        title: "What is AI?",
        description: "Introduction to artificial intelligence concepts",
        videoUrl: "https://example.com/video1",
        duration: 30,
        order: 1,
      },
      {
        title: "AI Applications",
        description: "Real-world applications of AI",
        videoUrl: "https://example.com/video2",
        duration: 25,
        order: 2,
      },
    ],
    createdBy: "user_2NNKQKqJGXf9LN8H5nGfh7xpqJK", // Example Clerk userId
    progress: 75,
    totalDuration: 55, // Sum of all content durations
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    updatedAt: "2024-03-15T10:30:00Z",
  },
  {
    title: "Machine Learning Basics",
    description: "Understanding the core concepts of Machine Learning",
    difficulty: "intermediate",
    category: "Machine Learning",
    topics: ["Supervised Learning", "Unsupervised Learning", "Model Training"],
    content: [
      {
        title: "Types of Machine Learning",
        description: "Overview of different ML approaches",
        videoUrl: "https://example.com/video3",
        duration: 45,
        order: 1,
      },
    ],
    createdBy: "user_2NNKQKqJGXf9LN8H5nGfh7xpqJK",
    progress: 40,
    totalDuration: 45,
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    updatedAt: "2024-03-10T10:30:00Z",
  },
  {
    title: "Natural Language Processing",
    description: "Deep dive into NLP techniques",
    difficulty: "advanced",
    category: "NLP",
    topics: ["Text Processing", "Sentiment Analysis", "Language Models"],
    content: [
      {
        title: "Introduction to NLP",
        description: "Basic concepts of natural language processing",
        videoUrl: "https://example.com/video4",
        duration: 40,
        order: 1,
      },
    ],
    createdBy: "user_2NNKQKqJGXf9LN8H5nGfh7xpqJK",
    progress: 90,
    totalDuration: 40,
    thumbnail: "https://example.com/default-thumbnail.jpg",
    updatedAt: "2024-03-14T10:30:00Z",
  },
];

async function populateCourses() {
  const mongoUri = process.env.DATABASE_URL;
  if (!mongoUri) {
    throw new Error("DATABASE_URL is not defined");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    await CourseModel.deleteMany({}); // Clear existing courses
    await CourseModel.insertMany(courses);
    console.log("Courses populated successfully");
  } catch (error) {
    console.error("Error populating courses:", error);
  } finally {
    await mongoose.disconnect();
  }
}

populateCourses();
