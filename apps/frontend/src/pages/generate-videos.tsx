import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/utils";
import FloatingNavbar from "@/components/floating-navbar";
import { Footer } from "@/components/footer";
import Loader from "@/components/loader";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";

export function GenerateVideosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const generateVideoMutation = useMutation({
    mutationFn: async ({
      topicIndex,
      query,
    }: {
      topicIndex: number;
      query: string;
    }) => {
      const response = await api.post(
        `/courses/${id}/topics/${topicIndex}/get-video`,
        {
          query,
        }
      );
      return { ...response.data, topicIndex };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    },
  });

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    },
  });

  const allVideosGenerated = course?.topics.every(
    (topic: any) => topic.video_id
  );
  const countVideosGenerated = course?.topics.filter(
    (topic: any) => topic.video_id
  ).length;
  const countVideosTotal = course?.topics.length;
  const progress =
    countVideosGenerated && countVideosTotal
      ? (countVideosGenerated / countVideosTotal) * 100
      : 0;

  useEffect(() => {
    if (course) {
      const generateNextVideo = async () => {
        const pendingTopic = course.topics.find(
          (topic: any) => !topic.video_id
        );
        if (pendingTopic) {
          const index = course.topics.indexOf(pendingTopic);
          await generateVideoMutation.mutateAsync({
            topicIndex: index,
            query: pendingTopic.youtube_query,
          });
        }
      };

      if (!generateVideoMutation.isPending) {
        generateNextVideo();
      }
    }
  }, [course, generateVideoMutation.isPending]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  if (allVideosGenerated) {
    navigate(`/courses/${id}`);
    return null;
  }

  return (
    <>
      <FloatingNavbar />
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-foreground bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                Generating Course Videos
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">
                We're preparing video content for your course topics
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-grow bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-primary/80 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${progress || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-primary">
                {(progress || 0).toFixed(0)}%
              </span>
            </div>

            <div className="space-y-6">
              {course.topics.map((topic: any, index: number) => {
                return (
                  <TopicCard
                    key={index}
                    topic={topic}
                    index={index}
                    course={course}
                  />
                );
              })}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

function TopicCard({ topic, index, course }: any) {
  const isGenerating =
    topic.video_id === null &&
    index === course?.topics.findIndex((t: any) => !t.video_id);
  const isSuccess = topic.video_id;
  const hasError = false;

  return (
    <div
      key={index}
      className="bg-card p-6 rounded-lg shadow-lg border flex items-center justify-between"
    >
      <div className="flex-grow">
        <h3 className="text-lg font-semibold">{topic.title}</h3>
        <p className="text-muted-foreground text-sm mt-1">
          {topic.description}
        </p>
      </div>
      <div className="ml-4 flex items-center gap-2">
        {isSuccess ? (
          <div className="flex items-center text-green-500">
            <CheckCircle className="w-5 h-5 mr-2" />
            Generated
          </div>
        ) : isGenerating ? (
          <div className="flex items-center text-blue-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating...
          </div>
        ) : hasError ? (
          <div className="flex items-center text-red-500">
            <XCircle className="w-5 h-5 mr-2" />
            Failed
          </div>
        ) : (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2" />
            Waiting...
          </div>
        )}
      </div>
    </div>
  );
}
