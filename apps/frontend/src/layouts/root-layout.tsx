import { Outlet, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { useEffect } from "react";
import { apiPublic } from "@/lib/utils";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export default function RootLayout() {
  const navigate = useNavigate();

  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();

  useEffect(() => {
    try {
      apiPublic.get("/health");
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <ClerkProvider
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
      afterMultiSessionSingleSignOutUrl="/dashboard"
      appearance={{
        variables: {
          colorPrimary: `hsl(${primaryColor})`,
        },
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
      <Outlet />
    </ClerkProvider>
  );
}
