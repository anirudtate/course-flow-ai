import { Outlet, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export default function RootLayout() {
  const navigate = useNavigate();

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
          colorPrimary: "hsl(221.2, 83.2%, 53.3%)",
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
