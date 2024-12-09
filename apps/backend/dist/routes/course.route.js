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
exports.coursesRouter = void 0;
const course_modal_1 = require("../modals/course.modal");
const express_1 = require("@clerk/express");
const express_2 = require("express");
const generative_ai_1 = require("@google/generative-ai");
const multer_1 = __importDefault(require("multer"));
const blob_1 = require("@vercel/blob");
const path_1 = require("path");
const inference_1 = require("@huggingface/inference");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// Model configuration
const MODEL_CONFIG = {
    provider: process.env.AI_PROVIDER || 'gemini', // 'gemini' or 'huggingface'
    huggingfaceModel: 'mistralai/Mixtral-8x7B-Instruct-v0.1'
};
exports.coursesRouter = (0, express_2.Router)();
exports.coursesRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = (0, express_1.getAuth)(req);
    try {
        const courses = yield course_modal_1.CourseModel.find({ createdBy: userId }).sort({ createdAt: -1 });
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
    if (!process.env.HUGGINGFACE_API_KEY) {
        res.status(500).json({ error: "Hugging Face API key is not configured" });
        return;
    }
    const hf = new inference_1.HfInference(process.env.HUGGINGFACE_API_KEY);
    const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const { userId } = (0, express_1.getAuth)(req);
    const { topic, difficulty } = req.body;
    if (!topic || !difficulty) {
        res.status(400).json({ error: "Topic and difficulty are required" });
        return;
    }
    const prompt = `Generate a detailed course outline for ${topic} at ${difficulty} level. 
    
The response MUST be a valid JSON object with the following schema:
{
  "title": "string - A concise, descriptive title for the course",
  "description": "string - A detailed 2-3 sentence description of the course",
  "topics": [
    {
      "title": "string - A concise, descriptive title for the topic",
      "description": "string - A detailed 2-3 sentence description of the topic",
      "order": "number - The order in which the topic should be displayed in the course"
    }
  ],
  "totalDuration": "number - Estimated total duration in hours (between 1-50)",
}

Ensure the response:
1. Contains ONLY the JSON object
2. Uses double quotes for all keys and string values
3. Has no trailing comma
4. Has properly escaped special characters
5. The imagePrompt should be usable for generating a thumbnail
6. Topics should be in the correct order
7. Topics should covert each step/topic required for one to complete the course
8. A topic should been posibbly covered in a youtube video/blog.
9. Follows the exact schema above`;
    try {
        let response;
        if (MODEL_CONFIG.provider === 'huggingface') {
            // Generate course content using Mixtral
            const result = yield hf.textGeneration({
                model: MODEL_CONFIG.huggingfaceModel,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 2048,
                    temperature: 0.7,
                    top_p: 0.95,
                    return_full_text: false,
                }
            });
            response = result.generated_text;
        }
        else {
            // Generate course content using Gemini
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = yield model.generateContent(prompt);
            response = result.response.text();
        }
        response = response.replace(/```json|```/g, "");
        response = response.replace(/```/g, "");
        let courseData;
        try {
            courseData = JSON.parse(response);
            // Validate the schema
            if (!courseData.title || !courseData.description ||
                !Array.isArray(courseData.topics) || !courseData.totalDuration) {
                throw new Error('Invalid schema');
            }
        }
        catch (error) {
            console.error("Error parsing AI response:", error, response);
            res.status(500).json({ error: "Failed to generate valid course data. Please try again." });
            return;
        }
        // Generate an image for the course using Hugging Face
        // try {
        //   const imageBlob = await hf.textToImage({
        //     inputs: courseData.title,
        //     model: "frankhenry6/ytthumbnail",
        //     parameters: {
        //       width: 768,
        //       height: 432,
        //       guidance_scale: 7.5,
        //       num_inference_steps: 50
        //     }
        //   });
        //   if (!imageBlob) {
        //     throw new Error("No image generated");
        //   }
        //   // Convert blob to Buffer
        //   const buffer = Buffer.from(await imageBlob.arrayBuffer());
        //   // Upload to Vercel Blob
        //   const { url } = await put(
        //     `course-thumbnails/${Date.now()}-${courseData.title.toLowerCase().replace(/\s+/g, '-')}.png`, 
        //     buffer, 
        //     { access: 'public' }
        //   );
        //   // Add the image URL to courseData
        //   courseData.thumbnail = url;
        // } catch (imageError) {
        //   console.error("Error generating image:", imageError);
        //   console.error("Error details:", JSON.stringify(imageError, null, 2));
        // }
        // Add additional required fields
        courseData.createdBy = userId;
        courseData.difficulty = difficulty;
        // Create new course in database
        const newCourse = new course_modal_1.CourseModel(courseData);
        yield newCourse.save();
        res.json(newCourse);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error generating course content" });
    }
}));
exports.coursesRouter.patch("/:id/thumbnail", upload.single("thumbnail"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = (0, express_1.getAuth)(req);
    const { id } = req.params;
    try {
        const course = yield course_modal_1.CourseModel.findById(id);
        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }
        if (course.createdBy !== userId) {
            res.status(403).json({ error: "Not authorized to update this course" });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }
        // Upload to Vercel Blob Store
        const blob = yield (0, blob_1.put)(`thumbnails/${id}-${Date.now()}${(0, path_1.join)(req.file.originalname)}`, req.file.buffer, {
            access: 'public',
            contentType: req.file.mimetype,
        });
        // Update course with new thumbnail URL
        course.thumbnail = blob.url;
        yield course.save();
        res.json({ thumbnail: blob.url });
    }
    catch (error) {
        console.error("Error updating thumbnail:", error);
        res.status(500).json({ error: "Error updating thumbnail" });
    }
}));
exports.coursesRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = (0, express_1.getAuth)(req);
    try {
        const course = yield course_modal_1.CourseModel.findById(req.params.id);
        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }
        // Check if the user owns the course
        if (course.createdBy !== userId) {
            res.status(403).json({ error: "Unauthorized to delete this course" });
            return;
        }
        yield course_modal_1.CourseModel.findByIdAndDelete(req.params.id);
        res.json({ message: "Course deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting course" });
    }
}));
