import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FloatingNavbar from "@/components/floating-navbar";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Compass,
  BarChart,
  Zap,
  Target,
  Rocket,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createElement } from "react";

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

function FeatureSection() {
  const features = [
    {
      title: "AI-Powered Curriculum",
      description:
        "Intelligent course structuring and content recommendations tailored to your learning goals.",
      icon: <Brain className="h-6 w-6" />,
    },
    {
      title: "Personalized Paths",
      description:
        "Custom learning journeys adapted to your pace, style, and objectives.",
      icon: <Compass className="h-6 w-6" />,
    },
    {
      title: "Progress Tracking",
      description:
        "Detailed analytics and insights to monitor your learning journey.",
      icon: <BarChart className="h-6 w-6" />,
    },
    {
      title: "Quick Start",
      description: "Get started instantly with AI-generated course outlines.",
      icon: <Zap className="h-6 w-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <div
          key={feature.title}
          className={cn(
            "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
            index === 0 && "lg:border-l dark:border-neutral-800"
          )}
        >
          <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
          <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
            {feature.icon}
          </div>
          <div className="text-lg font-bold mb-2 relative z-10 px-10">
            <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
            <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
              {feature.title}
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
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
              className="relative rounded-[1.5rem] sm:rounded-[2rem] p-2 sm:p-3 border-1 border-white/30 bg-white/15 backdrop-blur-xl shadow-[0_0_15px_rgba(255,255,255,0.25)]"
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
            className="relative"
          >
            {/* Connecting Line */}
            <motion.div
              className="absolute left-1/2 top-0 w-1 h-full bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
              {[
                {
                  number: "01",
                  title: "Choose Your Topic",
                  description: "Enter any topic you want to learn about",
                  icon: Target,
                },
                {
                  number: "02",
                  title: "Get Your Path",
                  description: "Our AI creates a structured learning path",
                  icon: Brain,
                },
                {
                  number: "03",
                  title: "Start Learning",
                  description: "Follow the steps and track your progress",
                  icon: Rocket,
                },
              ].map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={animations.item}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="p-6 text-center relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100"
                      initial={false}
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 5,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                    />
                    {/* Watermark Step Number */}
                    <div className="absolute -top-2 right-4 text-8xl font-bold text-muted-foreground/5 select-none">
                      {step.number}
                    </div>
                    <motion.div
                      className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
                      animate={{
                        y: [0, -5, 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.6,
                      }}
                    >
                      {createElement(step.icon, {
                        className: "w-8 h-8 text-primary",
                        strokeWidth: 1.5,
                      })}
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-3 relative z-10">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground relative z-10">
                      {step.description}
                    </p>

                    <motion.div
                      className="absolute bottom-0 left-0 w-full h-1 bg-primary/20"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                    />
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <SectionHeader
            badge="Features"
            title="Everything You Need to Learn Better"
            description="Powerful features to help you create and follow structured learning paths"
          />
          <FeatureSection />
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
