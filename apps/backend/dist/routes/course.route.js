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
Object.defineProperty(exports, "__esModule", { value: true });
exports.coursesRouter = void 0;
const course_modal_1 = require("../modals/course.modal");
const express_1 = require("@clerk/express");
const express_2 = require("express");
const generative_ai_1 = require("@google/generative-ai");
exports.coursesRouter = (0, express_2.Router)();
exports.coursesRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = (0, express_1.getAuth)(req);
    try {
        const courses = yield course_modal_1.CourseModel.find();
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching courses" });
    }
}));
exports.coursesRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield course_modal_1.CourseModel.findById(req.params.id);
        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching course" });
    }
}));
exports.coursesRouter.post("/generate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(process.env.GEMINI_API_KEY);
    const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const { userId } = (0, express_1.getAuth)(req);
    const { topic, difficulty } = req.body;
    if (!topic || !difficulty) {
        res.status(400).json({ error: "Topic and difficulty are required" });
        return;
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Create a structured course about "${topic}" for ${difficulty} level students. 
    Return the response in the following JSON format:
    {
      "title": "course title",
      "description": "comprehensive course description",
      "category": "main category",
      "topics": ["topic1", "topic2", "topic3"],
      "content": [
        {
          "title": "lesson title",
          "description": "lesson description",
          "videoUrl": "suggest a relevant YouTube video URL",
          "duration": estimated_duration_in_minutes,
          "order": lesson_number
        }
      ]
    }
    `;
        const result = yield model.generateContent(prompt);
        const response = result.response;
        const text = response
            .text()
            .replace(/```json|```/g, "")
            .replace(/```/g, "");
        console.log(text);
        try {
            const courseData = JSON.parse(text);
            // Add additional required fields
            courseData.createdBy = userId;
            courseData.difficulty = difficulty;
            courseData.thumbnail = "https://placeholder.com/350x200";
            courseData.totalDuration = courseData.content.reduce((total, lesson) => total + lesson.duration, 0);
            // Create new course in database
            const newCourse = new course_modal_1.CourseModel(courseData);
            yield newCourse.save();
            res.json(newCourse);
        }
        catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            res.status(500).json({ error: "Error parsing AI response", text });
        }
    }
    catch (error) {
        console.error("Error generating course:", error);
        res.status(500).json({ error: "Error generating course" });
    }
}));
