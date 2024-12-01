"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const course_modal_1 = require("../modals/course.modal");
dotenv_1.default.config();
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
function populateCourses() {
    return __awaiter(this, void 0, void 0, function* () {
        const mongoUri = process.env.DATABASE_URL;
        if (!mongoUri) {
            throw new Error("DATABASE_URL is not defined");
        }
        try {
            yield mongoose_1.default.connect(mongoUri);
            console.log("Connected to MongoDB");
            yield course_modal_1.CourseModel.deleteMany({}); // Clear existing courses
            yield course_modal_1.CourseModel.insertMany(courses);
            console.log("Courses populated successfully");
        }
        catch (error) {
            console.error("Error populating courses:", error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
populateCourses();
