import { useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";

export default function Dashboard() {
  const [courses, setCourses] = useState([
    { id: 1, title: "Introduction to AI", progress: 75 },
    { id: 2, title: "Machine Learning Basics", progress: 40 },
    { id: 3, title: "Natural Language Processing", progress: 90 },
    { id: 4, title: "Computer Vision Fundamentals", progress: 60 },
  ]);

  const addNewCourse = () => {
    const newCourse = {
      id: courses.length + 1,
      title: `New AI Course ${courses.length + 1}`,
      progress: 0,
    };
    setCourses([...courses, newCourse]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Your Courses
          </h2>
          <Button onClick={addNewCourse} className="bg-primary text-white">
            <Plus className="mr-2 h-4 w-4" /> Create New Course
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-card rounded-lg shadow-md overflow-hidden border-2"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {course.title}
                </h3>
                <div className="flex items-center">
                  <div className="flex-grow bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className="ml-4 text-sm font-medium text-muted-foreground">
                    {course.progress}%
                  </span>
                </div>
              </div>
              <div className="px-6 py-4 bg-muted">
                <Link
                  to={`/courses/${course.id}`}
                  className="text-sm font-medium text-primary hover:text-primary/70"
                >
                  Continue Course →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
