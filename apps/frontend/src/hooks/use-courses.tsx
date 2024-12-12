import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await api.get("/courses");
      return response.data as Course[];
    },
  });
}
