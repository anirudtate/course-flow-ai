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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  SidebarGroup,
  SidebarContent,
  SidebarFooter,
  SidebarProvider,
  Sidebar,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { api } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Brain,
} from "lucide-react";
import { useState } from "react";

import { Link, useParams, useSearchParams } from "react-router-dom";

export default function CoursePage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("section") ?? null;
  const [aiPrompt, setAiPrompt] = useState("");

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    },
  });

  const editStructureMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await api.post(`/courses/${id}/edit-structure`, {
        prompt,
      });
      return response.data;
    },
  });

  const handleAiEdit = async () => {
    try {
      await editStructureMutation.mutateAsync(aiPrompt);
      setAiPrompt("");
    } catch (error) {
      console.error("Failed to edit structure:", error);
    }
  };

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
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {topic.description}
            </p>
          </div>
        ))}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Brain className="mr-2 h-4 w-4" />
            Edit Course Structure with AI
          </Button>
        </DialogTrigger>
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
              onClick={handleAiEdit}
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
    </div>
  );

  return (
    <div className="min-h-screen">
      <FloatingNavbar hideWhenScrolling={false} />
      <SidebarProvider>
        <AppSidebar
          data={course}
          activeSection={activeSection ? activeSection : undefined}
          setActiveSection={(section) => setSearchParams({ section })}
        />
        <main className="flex flex-col w-full h-full">
          <div className="p-6 max-w-6xl mx-auto w-full">
            <div className="flex justify-between items-center">
              {activeSection ? (
                <Link to="/dashboard">
                  <Button variant="outline" className="w-fit">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  className="w-fit"
                  onClick={() => setSearchParams({})}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course Overview
                </Button>
              )}
              {activeTopic && activeSection && (
                <div className="flex items-center gap-2">
                  {parseInt(activeSection) > 0 && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSearchParams({
                          section: (parseInt(activeSection) - 1).toString(),
                        })
                      }
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous Lesson
                    </Button>
                  )}
                  {parseInt(activeSection) < course.topics.length - 1 && (
                    <Button
                      onClick={() =>
                        setSearchParams({
                          section: (parseInt(activeSection) + 1).toString(),
                        })
                      }
                    >
                      Next Lesson <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8">
              {activeTopic ? (
                <>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {activeTopic.title}
                  </h1>
                  <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
                    {activeTopic.description}
                  </p>
                  <div className="mt-6">
                    <div className="relative rounded-lg overflow-hidden border bg-background shadow-sm">
                      <iframe
                        className="w-full aspect-video"
                        src={activeTopic.videoUrl}
                        title="Video Player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      ></iframe>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                      <div>
                        Lesson{" "}
                        {parseInt(activeSection ? activeSection : "0") + 1} of{" "}
                        {course.topics.length}
                      </div>
                      <div className="flex items-center">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        {activeTopic.duration || "Video Lesson"}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <RenderCourseOverview />
              )}
            </div>
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    </div>
  );
}

function AppSidebar({
  data,
  setActiveSection,
  activeSection,
}: {
  data: any;
  setActiveSection: (section: string) => void;
  activeSection?: string;
}) {
  return (
    <Sidebar>
      <SidebarHeader className="h-16" />
      <SidebarContent className="px-4">
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-sm font-medium">
            Course Content
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.topics.map((item: any, index: number) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={index.toString() === activeSection?.toString()}
                  >
                    <div
                      className="cursor-pointer p-2 hover:bg-accent rounded-md transition-colors"
                      onClick={() => setActiveSection(index.toString())}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                        {item.completed && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
