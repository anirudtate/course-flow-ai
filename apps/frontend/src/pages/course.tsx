import { Footer } from "@/components/footer";
import Loader from "@/components/loader";
import FloatingNavbar from "@/components/floating-navbar";
import { Button } from "@/components/ui/button";
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
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, PlayCircle } from "lucide-react";
import { useEffect } from "react";

import { Link, useParams, useSearchParams } from "react-router-dom";

export default function CoursePage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("section") || "0";

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    },
  });

  useEffect(() => {
    if (!searchParams.has("section")) {
      setSearchParams({ section: "0" });
    }
  }, []);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  if (!course) return <div>Course not found</div>;

  const activeTopic = course.topics[parseInt(activeSection)];

  return (
    <div className="min-h-screen">
      <FloatingNavbar hideWhenScrolling={false} />
      <SidebarProvider>
        <AppSidebar
          data={course}
          activeSection={activeSection}
          setActiveSection={(section) => setSearchParams({ section })}
        />
        <main className="flex flex-col w-full h-full">
          <div className="p-6 max-w-6xl mx-auto w-full">
            <div className="flex justify-between items-center">
              <Link to="/dashboard">
                <Button variant="outline" className="w-fit">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
              </Link>
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
            </div>

            <div className="mt-8">
              <h1 className="text-2xl font-bold tracking-tight">
                {activeTopic?.title}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
                {activeTopic?.description}
              </p>
            </div>

            <div className="mt-6">
              <div className="relative rounded-lg overflow-hidden border bg-background shadow-sm">
                <iframe
                  className="w-full aspect-video"
                  src={activeTopic?.videoUrl}
                  title="Video Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                ></iframe>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                <div>
                  Lesson {parseInt(activeSection) + 1} of {course.topics.length}
                </div>
                <div className="flex items-center">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {activeTopic?.duration || "Video Lesson"}
                </div>
              </div>
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
  activeSection: string;
}) {
  return (
    <Sidebar>
      <SidebarHeader className="h-16" /> {/* Spacing for navbar */}
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
                    isActive={index.toString() === activeSection.toString()}
                  >
                    <div
                      className="cursor-pointer p-2 hover:bg-accent rounded-md transition-colors"
                      onClick={() => setActiveSection(index.toString())}
                    >
                      <span className="text-sm font-medium">{item.title}</span>
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
