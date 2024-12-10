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
const googleapis_1 = require("googleapis");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
exports.coursesRouter = (0, express_2.Router)();
exports.coursesRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = (0, express_1.getAuth)(req);
    try {
        const courses = yield course_modal_1.CourseModel.find({ createdBy: userId }).sort({
            createdAt: -1,
        });
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
    if (!topic) {
        res.status(400).json({ error: "Topic is required" });
        return;
    }
    const prompt = `
You are an expert course designer tasked with creating a comprehensive learning path for ${topic}.

Your task is to generate a well-structured course outline that:
1. Is suitable for ${difficulty} level learners
2. Progresses logically from fundamentals to more complex concepts
3. Includes practical, hands-on topics
4. The course should be as long as possible

Requirements for the response:
1. Must be a SINGLE valid JSON object (no additional text)
2. Use double quotes for all keys and string values
3. No trailing commas
4. All special characters must be properly escaped
5. Topics should be ordered from basic to advanced
6. Each topic should be completable in 15-30 minutes
7. Each topic's youtube_query should be specific enough to find relevant tutorial videos
8. Topic descriptions should be 2-3 sentences long
9. Must strictly follow the provided schema structure

The course should feel like a cohesive learning journey rather than a collection of random topics.`;
    try {
        let response;
        const schema = {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                title: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: "Title of the course",
                },
                description: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: "Detailed description of the course",
                },
                topics: {
                    type: generative_ai_1.SchemaType.ARRAY,
                    description: "List of topics in the course",
                    items: {
                        type: generative_ai_1.SchemaType.OBJECT,
                        properties: {
                            title: {
                                type: generative_ai_1.SchemaType.STRING,
                                description: "Title of the topic",
                            },
                            description: {
                                type: generative_ai_1.SchemaType.STRING,
                                description: "Detailed description of the topic",
                            },
                            youtube_query: {
                                type: generative_ai_1.SchemaType.STRING,
                                description: "Search query to find relevant YouTube video for this topic",
                            }
                        },
                        required: ["title", "description", "youtube_query"]
                    }
                }
            },
            required: ["title", "description", "topics"]
        };
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const result = yield model.generateContent(prompt);
        response = result.response.text();
        response = response.replace(/```json|```/g, "");
        response = response.replace(/```/g, "");
        let courseData;
        try {
            courseData = JSON.parse(response);
        }
        catch (error) {
            console.error("Error parsing AI response:", error, response);
            res.status(500).json({
                error: "Failed to generate valid course data. Please try again.",
            });
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
exports.coursesRouter.post("/:id/edit-structure", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = (0, express_1.getAuth)(req);
    const { prompt } = req.body;
    try {
        const course = yield course_modal_1.CourseModel.findById(req.params.id);
        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }
        if (!process.env.GEMINI_API_KEY) {
            res.status(500).json({ error: "Gemini API key is not configured" });
            return;
        }
        const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const schema = {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                title: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: "Title of the course",
                },
                description: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: "Detailed description of the course",
                },
                topics: {
                    type: generative_ai_1.SchemaType.ARRAY,
                    description: "List of topics in the course",
                    items: {
                        type: generative_ai_1.SchemaType.OBJECT,
                        properties: {
                            title: {
                                type: generative_ai_1.SchemaType.STRING,
                                description: "Title of the topic",
                            },
                            description: {
                                type: generative_ai_1.SchemaType.STRING,
                                description: "Detailed description of the topic",
                            },
                            youtube_query: {
                                type: generative_ai_1.SchemaType.STRING,
                                description: "Search query to find relevant YouTube video for this topic",
                            }
                        },
                        required: ["title", "description", "youtube_query"]
                    }
                }
            },
            required: ["title", "description", "topics"]
        };
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        console.log("AI Prompt:", JSON.stringify(course, null, 2));
        const aiPrompt = `
You are an expert course designer tasked with creating a comprehensive learning path for ${course.title}.
You are tasked with modifying an existing course structure based on the following user request: "${prompt}"

Current course structure:
${JSON.stringify(course, null, 2)}

Your task is to generate a well-structured course outline that:
1. Make required changes while preserving the existing structure that should not be changed
2. Progresses logically from fundamentals to more complex concepts
3. Includes practical, hands-on topics
4. The course should be as long as possible

Requirements for the response:
1. Must be a SINGLE valid JSON object (no additional text)
2. Use double quotes for all keys and string values
3. No trailing commas
4. All special characters must be properly escaped
5. Topics should be ordered from basic to advanced
6. Each topic should be completable in 15-30 minutes
7. Each topic's youtube_query should be specific enough to find relevant tutorial videos
8. Topic descriptions should be 2-3 sentences long
9. Must strictly follow the provided schema structure

The course should feel like a cohesive learning journey rather than a collection of random topics.`;
        const result = yield model.generateContent(aiPrompt);
        let response = result.response.text();
        response = response.replace(/```json|```/g, "");
        response = response.replace(/```/g, "");
        try {
            const updatedCourse = JSON.parse(response);
            // Update only specific fields to preserve metadata
            course.title = updatedCourse.title;
            course.description = updatedCourse.description;
            course.topics = updatedCourse.topics;
            yield course.save();
            res.json(course);
        }
        catch (parseError) {
            res.status(500).json({ error: "Failed to parse AI response", parseError });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error editing course structure", error });
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
            access: "public",
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
// Toggle topic completion status
exports.coursesRouter.post("/:id/topics/:topicIndex/toggle-completion", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = (0, express_1.getAuth)(req);
    const { id, topicIndex } = req.params;
    const { completed } = req.body;
    try {
        const course = yield course_modal_1.CourseModel.findById(id);
        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }
        // Check if user owns the course
        if (course.createdBy !== userId) {
            res.status(403).json({ error: "Not authorized to modify this course" });
            return;
        }
        // Check if topic index is valid
        if (Number(topicIndex) < 0 || Number(topicIndex) >= course.topics.length) {
            res.status(400).json({ error: "Invalid topic index" });
            return;
        }
        // Update the completion status of the specified topic
        course.topics[Number(topicIndex)].completed = completed;
        // Calculate and update course progress
        const completedTopics = course.topics.filter(topic => topic.completed).length;
        course.progress = (completedTopics / course.topics.length) * 100;
        // Save the updated course
        yield course.save();
        res.json(course);
    }
    catch (error) {
        console.error("Error toggling topic completion:", error);
        res.status(500).json({ error: "Error updating topic completion status" });
    }
}));
exports.coursesRouter.post("/:id/topics/:topicIndex/get-video", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = (0, express_1.getAuth)(req);
    const { id, topicIndex } = req.params;
    try {
        const course = yield course_modal_1.CourseModel.findById(id);
        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }
        // Check if user owns the course
        if (course.createdBy !== userId) {
            res.status(403).json({ error: "Not authorized to modify this course" });
            return;
        }
        // Check if topic index is valid
        if (Number(topicIndex) < 0 || Number(topicIndex) >= course.topics.length) {
            res.status(400).json({ error: "Invalid topic index" });
            return;
        }
        // Get the video id from youtube api
        const topic = course.topics[Number(topicIndex)];
        const videoId = yield getVideoId(topic.youtube_query);
        topic.video_id = videoId;
        course.topics[Number(topicIndex)] = topic;
        // Save the updated course
        yield course.save();
        res.json(course);
    }
    catch (error) {
        console.error("Error toggling topic completion:", error);
        res.status(500).json({ error: "Error updating topic completion status" });
    }
}));
function getVideoId(query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const youtube = googleapis_1.google.youtube({
                version: 'v3',
                auth: process.env.YOUTUBE_API_KEY
            });
            const response = yield youtube.search.list({
                part: ['id', 'snippet'],
                q: query,
                type: ['video'],
                videoEmbeddable: 'true',
                maxResults: 1,
                safeSearch: 'strict'
            });
            if (response.data.items && response.data.items.length > 0 && ((_a = response.data.items[0].id) === null || _a === void 0 ? void 0 : _a.videoId)) {
                return response.data.items[0].id.videoId;
            }
            return null;
        }
        catch (error) {
            console.error('Error fetching YouTube video:', error);
            return null;
        }
    });
}
