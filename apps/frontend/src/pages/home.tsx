import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FloatingNavbar from "@/components/floating-navbar";
import {
  ArrowRight,
  BookOpen,
  Youtube,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const animations = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

interface SectionHeaderProps {
  badge: string;
  title: string;
  description?: string;
}

function SectionHeader({ badge, title, description }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-10"
    >
      <Badge variant="secondary" className="mb-4">
        <Sparkles className="h-3.5 w-3.5 mr-1" />
        {badge}
      </Badge>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      variants={animations.item}
      whileHover={animations.hover}
      className="relative group"
    >
      <Card className="p-6 h-full">
        <div className="flex flex-col h-full">
          <div className="p-2 w-fit rounded-lg bg-primary/10 mb-4">{icon}</div>
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </Card>
    </motion.div>
  );
}

export function Home() {
  const { scrollYProgress } = useScroll();

  const dashboardY = useTransform(scrollYProgress, [0, 0.2], [-50, 0]);
  const dashboardRotateX = useTransform(scrollYProgress, [0, 0.2], [15, 0]);
  const dashboardScale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);

  return (
    <div className="flex min-h-screen flex-col">
      <FloatingNavbar showAccount={false} />
      {/* Hero Section */}
      <section className="relative py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container text-center"
        >
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            AI-Powered Learning Paths
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground max-w-[1000px] mx-auto leading-tight">
            Create structured learning paths with the power of AI
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Create personalized learning journeys powered by AI. Get curated
            resources and track your progress.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/create">
                Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/demo">Watch Demo</Link>
            </Button>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            className="mt-12 sm:mt-20 mb-8 sm:mb-16 relative mx-auto w-full md:max-w-5xl px-4 sm:p-8"
            style={{
              perspective: 1000,
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-600/60 via-emerald-500/60 to-violet-600/60 rounded-[1.5rem] sm:rounded-[2rem] blur-2xl"
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="relative rounded-[1.5rem] sm:rounded-[2rem] p-2 sm:p-3 border-2 border-white/40 bg-white/15 backdrop-blur-xl shadow-[0_0_15px_rgba(255,255,255,0.25)]"
              style={{
                y: window.innerWidth >= 768 ? dashboardY : 0,
                rotateX: window.innerWidth >= 768 ? dashboardRotateX : 0,
                scale: window.innerWidth >= 768 ? dashboardScale : 1,
                transformOrigin: "center top",
              }}
            >
              <img
                src="/dashboard.png"
                alt="Course Flow Dashboard"
                className="w-full md:w-full h-auto mx-auto rounded-xl sm:rounded-2xl"
                loading="eager"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-background relative">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] pointer-events-none" />
        <div className="container">
          <SectionHeader
            badge="Simple Process"
            title="Start Learning in Three Simple Steps"
            description="Get started with Course Flow in just a few simple steps"
          />

          <motion.div
            variants={animations.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                number: 1,
                title: "Choose Your Topic",
                description: "Enter any topic you want to learn about",
              },
              {
                number: 2,
                title: "Get Your Path",
                description: "Our AI creates a structured learning path",
              },
              {
                number: 3,
                title: "Start Learning",
                description: "Follow the steps and track your progress",
              },
            ].map((step) => (
              <motion.div key={step.number} variants={animations.item}>
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-background relative">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] pointer-events-none" />
        <div className="container">
          <SectionHeader
            badge="Key Features"
            title="Everything you need to learn effectively"
            description="Our AI-powered platform provides all the tools you need to create and follow structured learning paths"
          />

          <motion.div
            variants={animations.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 text-primary" />}
              title="Structured Learning"
              description="Get a clear, step-by-step learning path for any topic you want to master, carefully curated by our AI"
            />
            <FeatureCard
              icon={<Youtube className="h-8 w-8 text-primary" />}
              title="Curated Resources"
              description="Access hand-picked YouTube videos and blog posts for each learning step, ensuring quality content"
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-primary" />}
              title="Progress Tracking"
              description="Mark steps as complete and visualize your learning journey with detailed progress tracking"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <SectionHeader
            badge="Get Started Now"
            title="Transform Your Learning Journey Today"
            description="Join thousands of learners who are accelerating their growth with AI-powered learning paths. Start your journey to mastery now."
          />
          <div className="flex justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link to="/create">
                Create Your Path <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-8">
        <div className="container">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 course-flow-ai • All Rights Reserved • Created by{" "}
            <a
              href="https://github.com/anirudtate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Anirud Tate
            </a>{" "}
            and{" "}
            <a
              href="https://github.com/Sushils-Coding"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Sushil Verma
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
