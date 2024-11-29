import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash,
  Share,
  BookmarkPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/utils";
import { useState } from "react";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";

// Add form schema
const createCourseSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

export default function Dashboard() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await api.get("/courses");
      return response.data;
    },
  });

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createCourseSchema>>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      topic: "",
      difficulty: "beginner",
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createCourseSchema>) => {
      const response = await api.post("/courses/generate", values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (values: z.infer<typeof createCourseSchema>) => {
    createCourseMutation.mutate(values);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Management Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Your Courses
              </h2>
              <p className="text-muted-foreground mt-1">
                Continue learning where you left off
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Button
                className="shrink-0"
                onClick={() => setOpen(true)}
                disabled={createCourseMutation.isPending}
              >
                <Plus className="mr-2 h-4 w-4" />
                {createCourseMutation.isPending
                  ? "Generating..."
                  : "Create Course with AI"}
              </Button>
            </div>
          </div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="border bg-card rounded-md shadow-lg"
                >
                  <div className="relative">
                    <Skeleton className="w-full h-40 rounded-t-md" />
                    <div className="absolute top-3 right-3">
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="flex-grow h-1.5 rounded-full" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-1 w-1 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => (
                <div
                  key={course._id}
                  className="group border bg-card rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-t-md"
                      />
                    ) : (
                      <div className="w-full h-40 rounded-t-md bg-muted flex items-center justify-center">
                        <div className="text-muted-foreground text-center">
                          <BookmarkPlus className="h-8 w-8 mx-auto mb-2" />
                          <span className="text-sm">No image available</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 backdrop-blur-sm"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuItem
                            onClick={() => console.log("Edit with AI")}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit with AI
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash className="mr-2 h-4 w-4" /> Delete Course
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => console.log("Share")}
                          >
                            <Share className="mr-2 h-4 w-4" /> Share Course
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Save")}>
                            <BookmarkPlus className="mr-2 h-4 w-4" /> Save for
                            Later
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-grow bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary rounded-full h-1.5 transition-all duration-300"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-primary">
                          {course.progress || 0}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>Duration: {course.totalDuration}min</span>
                          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                          <span>
                            Last updated: {moment(course.updatedAt).fromNow()}
                          </span>
                        </div>
                      </div>

                      <div className="p-2" />
                      <Link to={`/courses/${course._id}`}>
                        <Button variant="secondary" className="w-full">
                          Continue Learning
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course with AI</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. JavaScript Fundamentals"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createCourseMutation.isPending}
                >
                  {createCourseMutation.isPending
                    ? "Generating Course..."
                    : "Generate Course"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
}
