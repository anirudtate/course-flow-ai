"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const courseSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
        type: String,
        required: true,
        enum: ["beginner", "intermediate", "advanced"],
    },
    topics: [
        {
            title: { type: String, required: true },
            description: { type: String, required: true },
            order: { type: Number, required: true },
        },
    ],
    createdBy: { type: String, required: true }, // Clerk userId
    progress: { type: Number, default: 0 },
    totalDuration: { type: Number, required: true }, // in minutes
    thumbnail: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
exports.CourseModel = mongoose_1.default.model("Course", courseSchema);
