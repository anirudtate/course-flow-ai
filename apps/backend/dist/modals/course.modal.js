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
    topics: [
        {
            title: { type: String, required: true },
            description: { type: String, required: true },
            youtube_query: { type: String, required: true },
            video_id: { type: String, required: false },
            completed: { type: Boolean, default: false },
        },
    ],
    progress: { type: Number, default: 0 },
    thumbnail: { type: String, default: "" },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
exports.CourseModel = mongoose_1.default.model("Course", courseSchema);
