"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { Brain, Menu, Search } from "lucide-react";
import { Button } from "./ui/button";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { AccountMenu } from "./account-menu";
import { Input } from "./ui/input";

const FloatingNavbar = ({
  showAccount = true,
  hideWhenScrolling = true,
}: { showAccount?: boolean; hideWhenScrolling?: boolean } = {}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!hideWhenScrolling) {
      setIsVisible(true);
      return;
    }
    const previous = scrollY.getPrevious();
    if (previous) {
      if (latest < previous) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  });

  return (
    <motion.div
      className="sticky top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.85,
        bounce: 0.25,
      }}
    >
      <div className="w-full px-4 py-2">
        <nav className="mx-auto max-w-7xl relative rounded-full bg-background flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-foreground" />
              <span className="font-semibold text-lg text-foreground">
                Course Flow AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {showAccount && (
              <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10 w-full md:w-[250px] bg-transparent"
                />
              </div>
            )}
            <ModeToggle
              buttonVariant="outline"
              buttonClassName="bg-transparent"
            />
            <div className="h-6 w-px bg-border" />
            {showAccount ? (
              <AccountMenu />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/sign-in">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <ModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Course Flow AI</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-4">
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full justify-start"
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full justify-start">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </motion.div>
  );
};

export default FloatingNavbar;
