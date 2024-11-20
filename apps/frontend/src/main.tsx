import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "@/pages/home";
import { SignIn, SignUp } from "@clerk/clerk-react";
import RootLayout from "./layouts/root-layout";
import DashboardLayout from "./layouts/dashboard-layout";
import Dashboard from "./pages/dashboard";

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
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(<App />);

function App() {
  return (
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </StrictMode>
  );
}
