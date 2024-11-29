import * as React from "react";
import { useAuth } from "@clerk/clerk-react";
import { Outlet, useNavigate } from "react-router-dom";
import Loader from "@/components/loader";

export default function DashboardLayout() {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoaded && !userId) {
      navigate("/sign-in");
    }
  }, [isLoaded]);

  if (!isLoaded)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Outlet />
    </div>
  );
}
