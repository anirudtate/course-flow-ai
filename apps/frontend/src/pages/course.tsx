import { Footer } from "@/components/footer";
import Loader from "@/components/loader";
import FloatingNavbar from "@/components/floating-navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  Brain,
  CheckCircle,
  CircleOff,
} from "lucide-react";
import { useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function CoursePage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("section") ?? null;
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    },
  });

  const toggleTopicCompletionMutation = useMutation({
    mutationFn: async ({
      topicIndex,
      completed,
    }: {
      topicIndex: number;
      completed: boolean;
    }) => {
      const response = await api.post(
        `/courses/${id}/topics/${topicIndex}/toggle-completion`,
        {
          completed,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the course query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    },
  });

  // useEffect(() => {
  //   if (!searchParams.has("section")) {
  //     setSearchParams({ section: "0" });
  //   }
  // }, []);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  if (!course) return <div>Course not found</div>;

  const activeTopic = activeSection
    ? course.topics[parseInt(activeSection)]
    : null;

  const RenderCourseOverview = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {course.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {course.topics.map((topic: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-lg border bg-card hover:border-primary transition-colors cursor-pointer"
            onClick={() => setSearchParams({ section: index.toString() })}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{topic.title}</h3>
              {topic.completed ? (
                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500">
                  Completed
                </Badge>
              ) : (
                <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-500">
                  Incomplete
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {topic.description}
            </p>
          </div>
        ))}
      </div>

      <EditWithAI id={id ?? ""} />
    </div>
  );

  return (
    <div className="min-h-screen">
      <FloatingNavbar hideWhenScrolling={false} />
      <main className="flex flex-col w-full h-full">
        <div className="p-6 max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            {activeSection ? (
              <Button
                variant="outline"
                className="w-fit"
                onClick={() => setSearchParams({})}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course Overview
              </Button>
            ) : (
              <Link to="/dashboard">
                <Button variant="outline" className="w-fit">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
              </Link>
            )}
            <Select
              value={activeSection ?? "overview"}
              onValueChange={(value) => {
                if (value === "overview") {
                  setSearchParams({});
                } else {
                  setSearchParams({ section: value });
                }
              }}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue
                  placeholder="Select a topic"
                  className="truncate"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="overview" className="truncate">
                    Course Overview
                  </SelectItem>
                  {course.topics.map((topic: any, index: number) => (
                    <SelectItem
                      key={index}
                      value={index.toString()}
                      className="truncate"
                    >
                      <div className="flex items-center gap-2 w-full">
                        {topic.completed ? (
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        )}
                        <span className="truncate">
                          Topic {index + 1}: {topic.title}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-8">
            {activeTopic ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {activeTopic.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    <Badge
                      className={
                        activeTopic.completed
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/10 hover:text-green-500"
                          : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"
                      }
                    >
                      {activeTopic.completed ? "Completed" : "Not Completed"}
                    </Badge>
                    <Button
                      variant={activeTopic.completed ? "outline" : "default"}
                      onClick={() =>
                        toggleTopicCompletionMutation.mutate({
                          topicIndex: parseInt(activeSection!),
                          completed: !activeTopic.completed,
                        })
                      }
                      disabled={toggleTopicCompletionMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {activeTopic.completed ? (
                        <CircleOff className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {activeTopic.completed
                        ? "Mark as Incomplete"
                        : "Mark as Complete"}
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
                  {activeTopic.description}
                </p>
                <div className="mt-6">
                  <div className="relative rounded-lg overflow-hidden border-4 bg-background shadow-sm">
                    <iframe
                      className="w-full aspect-video"
                      src={`https://www.youtube.com/embed/${activeTopic.video_id}`}
                      title="Video Player"
                      /* @ts-ignore */
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerpolicy="strict-origin-when-cross-origin"
                      allowfullscreen
                    ></iframe>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                    <div>
                      Lesson {parseInt(activeSection ? activeSection : "0") + 1}{" "}
                      of {course.topics.length}
                    </div>
                    <div className="flex items-center">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {activeTopic.duration || "Video Lesson"}
                    </div>
                  </div>
                </div>
                {activeSection && (
                  <div className="flex justify-between items-center mt-8 pt-8 border-t">
                    {parseInt(activeSection) > 0 ? (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setSearchParams({
                            section: (parseInt(activeSection) - 1).toString(),
                          })
                        }
                        className="flex flex-col items-start gap-1 h-auto py-2"
                      >
                        <div className="flex items-center text-sm text-muted-foreground">
                          <ArrowLeft className="mr-1 h-4 w-4" /> Previous Lesson
                        </div>
                        <span className="text-sm font-medium">
                          {course.topics[parseInt(activeSection) - 1].title}
                        </span>
                      </Button>
                    ) : (
                      <div />
                    )}
                    {parseInt(activeSection) < course.topics.length - 1 && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setSearchParams({
                            section: (parseInt(activeSection) + 1).toString(),
                          })
                        }
                        className="flex flex-col items-end gap-1 h-auto py-2 ml-auto"
                      >
                        <div className="flex items-center text-sm text-muted-foreground">
                          Next Lesson <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">
                          {course.topics[parseInt(activeSection) + 1].title}
                        </span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <RenderCourseOverview />
            )}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}

function EditWithAI({ id }: { id: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const editStructureMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await api.post(`/courses/${id}/edit-structure`, {
        prompt,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    },
  });

  const handleAiEdit = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title:
          "Please enter a description of how you'd like to modify the course",
      });
      return;
    }

    try {
      await editStructureMutation.mutateAsync(aiPrompt);
      setAiPrompt("");
      setIsDialogOpen(false);
      navigate(`/generate_videos/${id}`);
    } catch (error: any) {
      console.error("Failed to edit structure:", error);
      toast({
        title:
          error.response?.data?.error ||
          "Failed to edit course structure. Please try again.",
      });
    }
  };

  return (
    <>
      <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
        <Brain className="mr-2 h-4 w-4" />
        Edit Course Structure with AI
      </Button>

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Course Structure</DialogTitle>
              <DialogDescription>
                Describe how you'd like to modify the course structure. The AI
                will help reorganize and improve it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., Add a new section about advanced topics, or reorder sections for better flow"
                className="min-h-[100px]"
              />
              <Button
                onClick={async () => {
                  await handleAiEdit();
                }}
                disabled={editStructureMutation.isPending}
                className="w-full"
              >
                {editStructureMutation.isPending
                  ? "Processing..."
                  : "Apply Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
