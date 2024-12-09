import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { ThemeProvider } from "@/components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "@/pages/home";
import { SignIn, SignUp } from "@clerk/clerk-react";
import RootLayout from "./layouts/root-layout";
import DashboardLayout from "./layouts/dashboard-layout";
import Dashboard from "./pages/dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupAuthInterseptor } from "./lib/utils";
import CoursePage from "./pages/course";
import { CreateCourse } from "./pages/create-course";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/sign-in/*",
        element: (
          <div className="flex min-h-screen items-center justify-center">
            <SignIn path="/sign-in" />
          </div>
        ),
      },
      {
        path: "/sign-up/*",
        element: (
          <div className="flex min-h-screen items-center justify-center">
            <SignUp path="/sign-up" />
          </div>
        ),
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/create-course",
            element: <CreateCourse />,
          },
          {
            path: "/courses",
            element: <Dashboard />,
          },
          {
            path: "/courses/:id",
            element: <CoursePage />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(<App />);

setupAuthInterseptor();

function App() {
  const queryClient = new QueryClient();
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
