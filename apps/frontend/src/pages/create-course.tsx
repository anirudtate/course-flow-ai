import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { api } from "@/lib/utils";
import FloatingNavbar from "@/components/floating-navbar";
import { Footer } from "@/components/footer";

const createCourseSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

export function CreateCourse() {
  const navigate = useNavigate();
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
      navigate("/dashboard");
      form.reset();
    },
  });

  const onSubmit = (values: z.infer<typeof createCourseSchema>) => {
    createCourseMutation.mutate(values);
  };

  return (
    <>
      <FloatingNavbar />
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-foreground bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                Create New Course
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">
                Let AI help you create a personalized learning experience
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg border">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
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
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={createCourseMutation.isPending}
                    >
                      {createCourseMutation.isPending
                        ? "Generating Course..."
                        : "Generate Course"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
