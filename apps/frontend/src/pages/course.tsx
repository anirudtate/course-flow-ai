import { Footer } from "@/components/footer";
import Loader from "@/components/loader";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarContent,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
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
import { ArrowLeft, BookmarkPlus } from "lucide-react";
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

  const activeContent = course.content[parseInt(activeSection)];

  return (
    <SidebarProvider>
      <AppSidebar
        data={course}
        activeSection={activeSection}
        setActiveSection={(section) => setSearchParams({ section })}
      />
      <main className="flex flex-col w-full h-full">
        <Navbar startElement={<SidebarTrigger className="mr-2" />} />
        <div className="p-4 max-w-6xl mx-auto w-full">
          <Link to="/dashboard">
            <Button variant="outline" className="w-fit">
              <ArrowLeft /> Back Go Dashboard
            </Button>
          </Link>

          <div className="p-2" />
          <div className="text-lg font-bold">{activeContent.title}</div>
          <div className="p-1" />
          <div className="text-md text-muted-foreground">
            {activeContent.description}
          </div>
          <div className="p-2" />
          <iframe
            className="h-full rounded-lg aspect-video border-4"
            width="100%"
            src={activeContent.videoUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
          <div className="p-2" />
        </div>
        <div className="p-2" />
        <Footer />
      </main>
    </SidebarProvider>
  );
}

function AppSidebar({
  data,
  setActiveSection,
  activeSection,
}: {
  data: any;
  setActiveSection: (section: string) => void;
  activeSection: any;
}) {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        {/* <SidebarGroup>
          <Button variant="outline" className="w-fit">
            <ArrowLeft /> Back Go Dashboard
          </Button>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            {data.thumbnail ? (
              <img
                src={data.thumbnail}
                alt={data.title}
                className="w-full h-40 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-40 rounded-md bg-muted flex items-center justify-center">
                <div className="text-muted-foreground text-center">
                  <BookmarkPlus className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm">No image available</span>
                </div>
              </div>
            )}
          </SidebarGroupContent>
          <SidebarHeader>{data.title}</SidebarHeader>
          <SidebarGroupContent className="text-muted-foreground">
            {data.description}
          </SidebarGroupContent>
        </SidebarGroup> */}
        <SidebarGroup>
          <SidebarGroupLabel>Lessons</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.content.map((item: any, index: number) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={index.toString() === activeSection.toString()}
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => setActiveSection(index.toString())}
                    >
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
