import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { coursesRouter } from "./routes/course.route";
import { clerkMiddleware, requireAuth } from "@clerk/express";

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

const port = process.env.PORT || 3000;
const mongoUri = process.env.DATABASE_URL;

if (!mongoUri) {
  throw new Error("DATABASE_URL is not defined");
}

try {
  mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("MongoDB connection error:", error);
}

app.use("/courses", requireAuth(), coursesRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
