import { useUser } from "@clerk/clerk-react";

export function Dashboard() {
  const { user } = useUser();
  return <div>Hello {user?.username}</div>;
}
