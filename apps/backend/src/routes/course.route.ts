import { CourseModel } from "../modals/course.modal";
import { getAuth } from "@clerk/express";
import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const coursesRouter = Router();

coursesRouter.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const courses = await CourseModel.find();
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
  console.log(process.env.GEMINI_API_KEY);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const { userId } = getAuth(req);
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

    const result = await model.generateContent(prompt);
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
      courseData.totalDuration = courseData.content.reduce(
        (total: number, lesson: any) => total + lesson.duration,
        0
      );

      // Create new course in database
      const newCourse = new CourseModel(courseData);
      await newCourse.save();

      res.json(newCourse);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      res.status(500).json({ error: "Error parsing AI response", text });
    }
  } catch (error) {
    console.error("Error generating course:", error);
    res.status(500).json({ error: "Error generating course" });
  }
});
