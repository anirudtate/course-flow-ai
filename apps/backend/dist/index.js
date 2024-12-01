"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const course_route_1 = require("./routes/course.route");
const express_2 = require("@clerk/express");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, express_2.clerkMiddleware)());
const port = process.env.PORT || 3000;
const mongoUri = process.env.DATABASE_URL;
if (!mongoUri) {
    throw new Error("DATABASE_URL is not defined");
}
try {
    mongoose_1.default.connect(mongoUri);
    console.log("Connected to MongoDB");
}
catch (error) {
    console.error("MongoDB connection error:", error);
}
app.use("/courses", (0, express_2.requireAuth)(), course_route_1.coursesRouter);
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
