import { useUser } from "@clerk/clerk-react";
import { BookOpen, LogOut, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function Navbar() {
  const { user } = useUser();

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex justify-between items-center py-2.5">
          <div className="flex items-center gap-3">
            <BookOpen size={18} />
            <h1 className="text-lg font-bold text-foreground">
              Course Flow AI
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search courses..."
                className="p-1 pl-9 bg-muted"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={16}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-7 w-7 rounded-full"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={user?.fullName || ""}
                    />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {user?.fullName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
