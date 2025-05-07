import { CourseModel } from "../modals/course.modal";
import { getAuth } from "@clerk/express";
import { Router } from "express";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import multer from "multer";
import { put } from "@vercel/blob";
import { join } from "path";
import { createClient } from 'pexels';
import { google } from 'googleapis';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const coursesRouter = Router();

coursesRouter.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const courses = await CourseModel.find({ createdBy: userId }).sort({
      createdAt: -1,
    });
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
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const { userId } = getAuth(req);
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
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: "Title of the course",
        },
        description: {
          type: SchemaType.STRING,
          description: "Detailed description of the course",
        },
        topics: {
          type: SchemaType.ARRAY,
          description: "List of topics in the course",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: {
                type: SchemaType.STRING,
                description: "Title of the topic",
              },
              description: {
                type: SchemaType.STRING,
                description: "Detailed description of the topic",
              },
              youtube_query: {
                type: SchemaType.STRING,
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
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    const result = await model.generateContent(prompt);
    response = result.response.text();
    response = response.replace(/```json|```/g, "");
    response = response.replace(/```/g, "");

    let courseData;
    try {
      courseData = JSON.parse(response);
      courseData.createdBy = userId;
    } catch (error) {
      console.error("Error parsing AI response:", error, response);
      res.status(500).json({
        error: "Failed to generate valid course data. Please try again.",
      });
      return;
    }

    async function generateAndSaveThumbnail(course: any) {
      try {
        // First try Google Custom Search
        if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
          const imageUrl = await searchGoogleImages(course.title + " thumbnail");
          if (imageUrl) {
            // Fetch and save the image
            const response = await fetch(imageUrl);
            const imageBuffer = Buffer.from(await response.arrayBuffer());

            // Upload to Vercel Blob
            const { url } = await put(
              `course-thumbnails/${Date.now()}-${course.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
              imageBuffer,
              { access: 'public' }
            );

            // Update course with thumbnail URL
            course.thumbnail = url;
            await course.save();
            console.log(`Successfully saved Google Images thumbnail for course: ${course.title}`);
            return;
          }
        }

        // Fallback to Pexels if Google search fails
        if (process.env.PEXELS_API_KEY) {
          const pexelsClient = createClient(process.env.PEXELS_API_KEY);
          const searchResults = await pexelsClient.photos.search({
            query: course.title,
            per_page: 1,
            orientation: 'landscape'
          });

          if ('photos' in searchResults && searchResults.photos && searchResults.photos.length > 0) {
            const imageUrl = searchResults.photos[0].src.large;
            const response = await fetch(imageUrl);
            const imageBuffer = Buffer.from(await response.arrayBuffer());

            const { url } = await put(
              `course-thumbnails/${Date.now()}-${course.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
              imageBuffer,
              { access: 'public' }
            );

            course.thumbnail = url;
            await course.save();
            console.log(`Successfully saved Pexels thumbnail for course: ${course.title}`);
          }
        }
      } catch (error) {
        console.error(`Error getting thumbnail for course ${course.title}:`, error);
      }
    }

    async function searchGoogleImages(query: string): Promise<string | null> {
      try {
        const customsearch = google.customsearch('v1');
        const response = await customsearch.cse.list({
          auth: process.env.GOOGLE_API_KEY,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          q: query,
          searchType: 'image',
          num: 1,
          imgSize: 'large',
          safe: 'active',
          imgType: 'photo'
        });

        console.log("google images response", response);

        if (response.data.items && response.data.items.length > 0) {
          return response?.data?.items[0]?.link ?? null;
        }
        return null;
      } catch (error) {
        console.error('Error searching Google Images:', error);
        return null;
      }
    }

    // Create new course in database
    const newCourse = new CourseModel(courseData);
    await newCourse.save();

    // Trigger thumbnail generation asynchronously
    if (process.env.GOOGLE_API_KEY || process.env.PEXELS_API_KEY) {
      generateAndSaveThumbnail(newCourse).catch(error => {
        console.error("Error in async thumbnail generation:", error);
      });
    }

    res.json(newCourse);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error generating course content" });
  }
});

coursesRouter.post("/:id/edit-structure", async (req, res) => {
  const { userId } = getAuth(req);
  const { prompt } = req.body;

  try {
    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: "Gemini API key is not configured" });
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: "Title of the course",
        },
        description: {
          type: SchemaType.STRING,
          description: "Detailed description of the course",
        },
        topics: {
          type: SchemaType.ARRAY,
          description: "List of topics in the course",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: {
                type: SchemaType.STRING,
                description: "Title of the topic",
              },
              description: {
                type: SchemaType.STRING,
                description: "Detailed description of the topic",
              },
              youtube_query: {
                type: SchemaType.STRING,
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
      model: "gemini-2.0-flash",
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

    const result = await model.generateContent(aiPrompt);
    let response = result.response.text();
    response = response.replace(/```json|```/g, "");
    response = response.replace(/```/g, "");
    
    try {
      const updatedCourse = JSON.parse(response);
      // Update only specific fields to preserve metadata
      course.title = updatedCourse.title;
      course.description = updatedCourse.description;
      course.topics = updatedCourse.topics;
      
      await course.save();
      res.json(course);
    } catch (parseError) {
      res.status(500).json({ error: "Failed to parse AI response", parseError });
    }
  } catch (error) {
    res.status(500).json({ message: "Error editing course structure", error });
  }
});

coursesRouter.post("/:id/edit-thumbnail", upload.single("thumbnail"), async (req, res) => {
  const { userId } = getAuth(req);
  const { id } = req.params;

  try {
    const course = await CourseModel.findById(id);
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
    const blob = await put(
      `thumbnails/${id}-${Date.now()}${join(req.file.originalname)}`,
      req.file.buffer,
      {
        access: "public",
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

// Toggle topic completion status
coursesRouter.post("/:id/topics/:topicIndex/toggle-completion", async (req, res) => {
  const { userId } = getAuth(req);
  const { id, topicIndex } = req.params;
  const { completed } = req.body;

  try {
    const course = await CourseModel.findById(id);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return
    }

    // Check if user owns the course
    if (course.createdBy !== userId) {
      res.status(403).json({ error: "Not authorized to modify this course" });
      return
    }

    // Check if topic index is valid
    if (Number(topicIndex) < 0 || Number(topicIndex) >= course.topics.length) {
      res.status(400).json({ error: "Invalid topic index" });
      return
    }

    // Update the completion status of the specified topic
    course.topics[Number(topicIndex)].completed = completed;
    
    // Calculate and update course progress
    const completedTopics = course.topics.filter(topic => topic.completed).length;
    course.progress = (completedTopics / course.topics.length) * 100;
    
    // Save the updated course
    await course.save();

    res.json(course);
  } catch (error) {
    console.error("Error toggling topic completion:", error);
    res.status(500).json({ error: "Error updating topic completion status" });
  }
});

coursesRouter.post("/:id/topics/:topicIndex/get-video", async (req, res) => {
  const { userId } = getAuth(req);
  const { id, topicIndex } = req.params;

  try {
    const course = await CourseModel.findById(id);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return
    }

    // Check if user owns the course
    if (course.createdBy !== userId) {
      res.status(403).json({ error: "Not authorized to modify this course" });
      return
    }

    // Check if topic index is valid
    if (Number(topicIndex) < 0 || Number(topicIndex) >= course.topics.length) {
      res.status(400).json({ error: "Invalid topic index" });
      return
    }

    // Get the video id from youtube api
    const topic = course.topics[Number(topicIndex)];
    const videoId = await getVideoId(topic.youtube_query);
    topic.video_id = videoId;
    course.topics[Number(topicIndex)] = topic;

    
    // Save the updated course
    await course.save();

    res.json(course);
  } catch (error) {
    console.error("Error toggling topic completion:", error);
    res.status(500).json({ error: "Error updating topic completion status" });
  }
});

async function getVideoId(query: string): Promise<string | null> {
  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });

    const exactResponse = await searchYouTube(youtube, query);
    if (exactResponse) return exactResponse;

    return null;
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    return null;
  }
}

async function searchYouTube(youtube: any, query: string): Promise<string | null> {
  try {
    const response = await youtube.search.list({
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
    const scoredVideos = response.data.items.map((item: any) => {
      let score = 0;
      const title = item.snippet?.title?.toLowerCase() || '';
      const description = item.snippet?.description?.toLowerCase() || '';
      const searchTerms = query.toLowerCase().split(' ');

      // Score based on title matches
      searchTerms.forEach(term => {
        if (title.includes(term)) score += 2;
        if (description.includes(term)) score += 1;
      });

      // Bonus points for educational indicators
      if (title.includes('tutorial') || title.includes('guide') || 
          title.includes('learn') || title.includes('introduction')) {
        score += 3;
      }

      return { videoId: item.id?.videoId, score };
    });

    // Sort by score and get the best match
    scoredVideos.sort((a: any, b: any) => b.score - a.score);
    return scoredVideos[0]?.videoId || null;
  } catch (error) {
    console.error('Error in YouTube search:', error);
    return null;
  }
}
