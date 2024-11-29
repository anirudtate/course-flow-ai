import Loader from "@/components/loader";
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
} from "@/components/ui/sidebar";
import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useParams, useSearchParams } from "react-router-dom";

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
        setActiveSection={(section) => setSearchParams({ section })}
      />
      <main>
        <SidebarTrigger />
        <div>{activeContent.title}</div>
      </main>
    </SidebarProvider>
  );
}

function AppSidebar({
  data,
  setActiveSection,
}: {
  data: any;
  setActiveSection: (section: string) => void;
}) {
  return (
    <Sidebar>
      {/* <SidebarHeader /> */}
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.content.map((item: any, index: number) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
