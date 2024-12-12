import { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { useNavigate } from "react-router-dom";

export function CourseSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const { data: courses = [] } = useCourses();
  const navigate = useNavigate();

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <Command className="rounded-lg border shadow-md">
          <div
            className="flex items-center border-b px-3"
            cmdk-input-wrapper=""
          >
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search courses..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            {filteredCourses.length === 0 && (
              <Command.Empty>No courses found.</Command.Empty>
            )}
            {filteredCourses.map((course) => (
              <Command.Item
                key={course._id}
                value={course.title}
                onSelect={() => {
                  navigate(`/courses/${course._id}`);
                  onOpenChange(false);
                }}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {course.description}
                  </p>
                </div>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
