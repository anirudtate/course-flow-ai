import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash,
  BookmarkPlus,
  ArrowRight,
  Image,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, cn } from "@/lib/utils";
import { useState } from "react";
import { Footer } from "@/components/footer";
import FloatingNavbar from "@/components/floating-navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const animations = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
    },
  },
  item: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      y: 0,
    },
    transition: {
      duration: 0.2,
    },
  },
};

// Add form schema
const createCourseSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

export default function Dashboard() {
  const {
    data: courses = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await api.get("/courses");
      return response.data;
    },
  });

  const [open, setOpen] = useState(false);
  const [thumbnailDialogOpen, setThumbnailDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
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

  const updateThumbnailMutation = useMutation({
    mutationFn: async ({
      courseId,
      file,
    }: {
      courseId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("thumbnail", file);
      try {
        const response = await api.patch(
          `/courses/${courseId}/thumbnail`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      } catch (error: any) {
        if (error.response?.data?.includes("File too large")) {
          throw new Error(
            "File size exceeds the limit (5MB). Please choose a smaller file."
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      setThumbnailDialogOpen(false);
      setSelectedCourse(null);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => {
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await api.delete(`/courses/${courseId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setCourseToDelete(null);
    },
  });

  const handleDeleteCourse = (courseId: string) => {
    setCourseToDelete(courseId);
  };

  const handleThumbnailUpdate = (courseId: string) => {
    setSelectedCourse(courseId);
    setThumbnailDialogOpen(true);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedCourse) return;

    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedCourse) return;

    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setSelectedFile(file);
    updateThumbnailMutation.mutate({ courseId: selectedCourse, file });
  };

  const onSubmit = (values: z.infer<typeof createCourseSchema>) => {
    createCourseMutation.mutate(values);
  };

  return (
    <>
      <FloatingNavbar />
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Course Management Section */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={animations.container}
            className="space-y-8"
          >
            <motion.div
              variants={animations.item}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
            >
              <div>
                <h2 className="text-4xl font-bold text-foreground bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                  Your Learning Journey
                </h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Continue learning and growing with our AI-powered courses
                </p>
              </div>
              <motion.div
                variants={animations.item}
                className="flex gap-4 w-full md:w-auto"
              >
                <Button
                  size="lg"
                  className="shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setOpen(true)}
                  disabled={createCourseMutation.isPending}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {createCourseMutation.isPending
                    ? "Generating..."
                    : "Create Course with AI"}
                </Button>
              </motion.div>
            </motion.div>

            {/* Course Grid */}
            {isLoading || isFetching ? (
              <motion.div
                variants={animations.item}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="border bg-card rounded-lg shadow-lg"
                  >
                    <div className="relative">
                      <Skeleton className="w-full h-48 rounded-t-lg" />
                      <div className="absolute top-3 right-3">
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </div>
                    <div className="p-6">
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
              </motion.div>
            ) : (
              <motion.div
                variants={animations.container}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {courses.map((course: any) => (
                  <motion.div
                    key={course._id}
                    variants={animations.item}
                    className="group border bg-card rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative overflow-hidden rounded-t-lg border-b">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 rounded-t-lg bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                          <div className="text-primary text-center">
                            <BookmarkPlus className="h-10 w-10 mx-auto mb-2" />
                            <span className="text-sm font-medium">
                              No image available
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              className="h-8 w-8 p-0 absolute top-2 right-3"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => console.log("Edit with AI")}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit with AI
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleThumbnailUpdate(course._id)}
                            >
                              <Image className="mr-2 h-4 w-4" />
                              Update Thumbnail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCourse(course._id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4 h-[60px]">
                        <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                      </div>

                      <div className="space-y-4 flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="flex-grow bg-muted rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary to-primary/80 rounded-full h-2 transition-all duration-300"
                              style={{ width: `${course.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-primary">
                            {course.progress || 0}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Duration: {course.totalDuration}min
                            </span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                            <span>
                              Updated {moment(course.updatedAt).fromNow()}
                            </span>
                          </div>
                        </div>
                        <Link to={`/courses/${course._id}`}>
                          <Button variant="secondary" className="w-full">
                            Continue Learning
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </main>
        <Dialog
          open={thumbnailDialogOpen}
          onOpenChange={setThumbnailDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Course Thumbnail</DialogTitle>
              <DialogDescription>
                Choose a new thumbnail image for your course. The image should
                be in JPG, PNG, or WebP format and less than 5MB.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div
                className={cn(
                  "w-full rounded-lg border-2 border-dashed p-4 transition-colors",
                  "hover:bg-muted/50 cursor-pointer",
                  updateThumbnailMutation.isPending &&
                    "opacity-50 cursor-not-allowed"
                )}
                onClick={() =>
                  !updateThumbnailMutation.isPending &&
                  document.getElementById("thumbnail")?.click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (
                    !updateThumbnailMutation.isPending &&
                    e.dataTransfer.files?.[0]
                  ) {
                    handleFileChange({
                      target: { files: e.dataTransfer.files },
                    } as any);
                  }
                }}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    Drag and drop your image here, or click to select
                  </div>
                </div>
              </div>
              <Input
                id="thumbnail"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={updateThumbnailMutation.isPending}
                className="hidden"
              />
              {selectedFile && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Selected Image:</div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Thumbnail preview"
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              {updateThumbnailMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading thumbnail...</span>
                </div>
              )}
              {updateThumbnailMutation.isError && (
                <div className="text-sm text-destructive">
                  {updateThumbnailMutation.error.message ||
                    "Failed to upload thumbnail. Please try again."}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setThumbnailDialogOpen(false)}
                disabled={updateThumbnailMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedFile || updateThumbnailMutation.isPending}
                onClick={() => {
                  if (selectedFile && selectedCourse) {
                    handleFileUpload({
                      target: { files: [selectedFile] },
                    } as any);
                  }
                }}
              >
                {updateThumbnailMutation.isPending
                  ? "Uploading..."
                  : "Update Thumbnail"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
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
        <AlertDialog
          open={!!courseToDelete}
          onOpenChange={() => setCourseToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                course and all its content.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  courseToDelete && deleteCourse.mutate(courseToDelete)
                }
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Footer />
    </>
  );
}
