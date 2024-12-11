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
const pexels_1 = require("pexels");
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
7. Each topic's youtube_query must be highly specific and educational-focused:
   - Include words like "tutorial", "guide", or "learn"
   - Focus on the exact concept being taught
   - Include relevant programming language or framework names
   - Example: "javascript array map function tutorial" instead of just "array map"
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
                                description: "A specific, educational-focused search query to find a relevant YouTube tutorial video for this topic. Should include keywords like 'tutorial', 'guide', or 'learn' and be focused on the exact concept being taught. For example: 'javascript array map function tutorial' or 'learn python list comprehension guide'",
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
            courseData.createdBy = userId;
        }
        catch (error) {
            console.error("Error parsing AI response:", error, response);
            res.status(500).json({
                error: "Failed to generate valid course data. Please try again.",
            });
            return;
        }
        function generateAndSaveThumbnail(course) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const pexelsClient = (0, pexels_1.createClient)(process.env.PEXELS_API_KEY);
                    // Search for relevant images
                    const searchResults = yield pexelsClient.photos.search({
                        query: course.title,
                        per_page: 1,
                        orientation: 'landscape'
                    });
                    // Type guard to check if searchResults has photos
                    if (!('photos' in searchResults) || !searchResults.photos || searchResults.photos.length === 0) {
                        throw new Error("No images found on Pexels or invalid search results");
                    }
                    // Get the image URL
                    const imageUrl = searchResults.photos[0].src.large;
                    // Fetch the image
                    const response = yield fetch(imageUrl);
                    const imageBuffer = Buffer.from(yield response.arrayBuffer());
                    // Upload to Vercel Blob
                    const { url } = yield (0, blob_1.put)(`course-thumbnails/${Date.now()}-${course.title.toLowerCase().replace(/\s+/g, '-')}.jpg`, imageBuffer, { access: 'public' });
                    // Update course with thumbnail URL
                    course.thumbnail = url;
                    yield course.save();
                    console.log(`Successfully saved thumbnail for course: ${course.title}`);
                }
                catch (error) {
                    console.error(`Error getting thumbnail for course ${course.title}:`, error);
                }
            });
        }
        // Create new course in database
        const newCourse = new course_modal_1.CourseModel(courseData);
        yield newCourse.save();
        // Trigger thumbnail generation asynchronously
        if (process.env.PEXELS_API_KEY) {
            generateAndSaveThumbnail(newCourse).catch(error => {
                console.error("Error in async thumbnail generation:", error);
            });
        }
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
                                description: "A specific, educational-focused search query to find a relevant YouTube tutorial video for this topic. Should include keywords like 'tutorial', 'guide', or 'learn' and be focused on the exact concept being taught. For example: 'javascript array map function tutorial' or 'learn python list comprehension guide'",
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
7. Each topic's youtube_query must be highly specific and educational-focused:
   - Include words like "tutorial", "guide", or "learn"
   - Focus on the exact concept being taught
   - Include relevant programming language or framework names
   - Example: "javascript array map function tutorial" instead of just "array map"
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
exports.coursesRouter.post("/:id/edit-thumbnail", upload.single("thumbnail"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        try {
            const youtube = googleapis_1.google.youtube({
                version: 'v3',
                auth: process.env.YOUTUBE_API_KEY
            });
            const exactResponse = yield searchYouTube(youtube, query);
            if (exactResponse)
                return exactResponse;
            return null;
        }
        catch (error) {
            console.error('Error fetching YouTube video:', error);
            return null;
        }
    });
}
function searchYouTube(youtube, query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield youtube.search.list({
                part: ['id', 'snippet'],
                q: query,
                type: ['video'],
                videoEmbeddable: 'true',
                maxResults: 5, // Get more results to filter
                safeSearch: 'strict',
                relevanceLanguage: 'en',
                videoDuration: 'medium', // Filter for medium length videos
                videoDefinition: 'high', // Prefer HD videos
                fields: 'items(id/videoId,snippet/title,snippet/description)', // Only get needed fields
            });
            if (!response.data.items || response.data.items.length === 0) {
                return null;
            }
            // Filter and score videos based on relevance
            const scoredVideos = response.data.items.map((item) => {
                var _a, _b, _c, _d, _e;
                let score = 0;
                const title = ((_b = (_a = item.snippet) === null || _a === void 0 ? void 0 : _a.title) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
                const description = ((_d = (_c = item.snippet) === null || _c === void 0 ? void 0 : _c.description) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || '';
                const searchTerms = query.toLowerCase().split(' ');
                // Score based on title matches
                searchTerms.forEach(term => {
                    if (title.includes(term))
                        score += 2;
                    if (description.includes(term))
                        score += 1;
                });
                // Bonus points for educational indicators
                if (title.includes('tutorial') || title.includes('guide') ||
                    title.includes('learn') || title.includes('introduction')) {
                    score += 3;
                }
                return { videoId: (_e = item.id) === null || _e === void 0 ? void 0 : _e.videoId, score };
            });
            // Sort by score and get the best match
            scoredVideos.sort((a, b) => b.score - a.score);
            return ((_a = scoredVideos[0]) === null || _a === void 0 ? void 0 : _a.videoId) || null;
        }
        catch (error) {
            console.error('Error in YouTube search:', error);
            return null;
        }
    });
}
