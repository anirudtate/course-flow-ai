import { CourseModel } from "../modals/course.modal";
import { getAuth } from "@clerk/express";
import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";
import { put } from "@vercel/blob";
import { join } from "path";
import { HfInference } from "@huggingface/inference";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Model configuration
const MODEL_CONFIG = {
  provider: process.env.AI_PROVIDER || 'gemini', // 'gemini' or 'huggingface'
  huggingfaceModel: 'mistralai/Mixtral-8x7B-Instruct-v0.1'
};

export const coursesRouter = Router();

coursesRouter.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const courses = await CourseModel.find({ createdBy: userId }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Error fetching courses" });
  }
});

coursesRouter.get("/:id", async (req, res) => {
  try {
    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Error fetching course" });
  }
});

coursesRouter.post("/generate", async (req, res) => {
  if (!process.env.HUGGINGFACE_API_KEY) {
    res.status(500).json({ error: "Hugging Face API key is not configured" });
    return;
  }

  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const { userId } = getAuth(req);
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
      const result = await hf.textGeneration({
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
    } else {
      // Generate course content using Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
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
    } catch (error) {
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
    const newCourse = new CourseModel(courseData);
    await newCourse.save();

    res.json(newCourse);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error generating course content" });
  }
});

coursesRouter.patch("/:id/thumbnail", upload.single("thumbnail"), async (req, res) => {
  const { userId } = getAuth(req);
  const { id } = req.params;

  try {
    const course = await CourseModel.findById(id);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return
    }

    if (course.createdBy !== userId) {
      res.status(403).json({ error: "Not authorized to update this course" });
      return
    }

    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return
    }

    // Upload to Vercel Blob Store
    const blob = await put(
      `thumbnails/${id}-${Date.now()}${join(req.file.originalname)}`, 
      req.file.buffer,
      {
        access: 'public',
        contentType: req.file.mimetype,
      }
    );

    // Update course with new thumbnail URL
    course.thumbnail = blob.url;
    await course.save();

    res.json({ thumbnail: blob.url });
  } catch (error) {
    console.error("Error updating thumbnail:", error);
    res.status(500).json({ error: "Error updating thumbnail" });
  }
});

coursesRouter.delete("/:id", async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    
    // Check if the user owns the course
    if (course.createdBy !== userId) {
      res.status(403).json({ error: "Unauthorized to delete this course" });
      return;
    }

    await CourseModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting course" });
  }
});
