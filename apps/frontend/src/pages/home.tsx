import { Icon } from "@/components/icon";
import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "@/components/theme-provider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowRight, BookOpen, ChevronsDown, ChevronsDownIcon, Github, icons, Menu, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Home() {
  return (
    <div className="w-full flex flex-col items-center">
      <Navbar />
      <HeroSection />
      <BenefitsSection />
      <FeaturesSection />
      <ServicesSection />
      <TestimonialSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}

interface RouteProps {
  to: string;
  label: string;
}

interface FeatureProps {
  title: string;
  description: string;
}

const routeList: RouteProps[] = [
  {
    to: "#testimonials",
    label: "Testimonials",
  },
  {
    to: "#faq",
    label: "FAQ",
  },
];

const navFeatureList: FeatureProps[] = [
  {
    title: "Showcase Your Value ",
    description: "Highlight how your product solves user problems.",
  },
  {
    title: "Build Trust",
    description:
      "Leverages social proof elements to establish trust and credibility.",
  },
  {
    title: "Capture Leads",
    description:
      "Make your lead capture form visually appealing and strategically.",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl mx-auto flex justify-between items-center p-4 bg-card">
      <Link to="/" className="font-bold text-lg flex items-center gap-2 ml-2">
        <BookOpen className="w-6 h-6 text-white" />
        Course Flow
      </Link>
      {/* <!-- Mobile --> */}
      <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Menu
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer lg:hidden"
            />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card border-secondary"
          >
            <div>
              <SheetHeader className="mb-4 ml-4">
                <SheetTitle className="flex items-center">
                  <Link to="/" className="flex items-center">
                    <ChevronsDown className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white" />
                    Course Flow
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {routeList.map(({ to, label }) => (
                  <Button
                    key={to}
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="ghost"
                    className="justify-start text-base"
                  >
                    <Link to={to}>{label}</Link>
                  </Button>
                ))}
              </div>
            </div>

            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
              <Separator className="mb-2" />

              <ModeToggle />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* <!-- Desktop --> */}
      <NavigationMenu className="hidden lg:block mx-auto">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-card text-base">
              Features
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[600px] grid-cols-2 gap-5 p-4">
                <img
                  src="https://avatars.githubusercontent.com/u/75042455?v=4"
                  alt="RadixLogo"
                  className="h-full w-full rounded-md object-cover"
                  width={600}
                  height={600}
                />
                <ul className="flex flex-col gap-2">
                  {navFeatureList.map(({ title, description }) => (
                    <li
                      key={title}
                      className="rounded-md p-3 text-sm hover:bg-muted"
                    >
                      <p className="mb-1 font-semibold leading-none text-foreground">
                        {title}
                      </p>
                      <p className="line-clamp-2 text-muted-foreground">
                        {description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            {routeList.map(({ to, label }) => (
              <NavigationMenuLink key={to} asChild>
                <Link to={to} className="text-base px-2">
                  {label}
                </Link>
              </NavigationMenuLink>
            ))}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="hidden lg:flex">
        <ModeToggle />

        <Button asChild size="icon" variant="ghost" aria-label="View on GitHub">
          <Link
            aria-label="View on GitHub"
            to="https://github.com/nobruf/shadcn-landing-page.git"
            target="_blank"
          >
            <Github className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
};

function HeroSection() {
  const { theme } = useTheme();
  return (
    <section className="container">
      <div className="grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Badge variant="outline" className="text-sm py-2">
              <span className="mr-2 text-primary">
                <Badge className="animate-pulse">Beta</Badge>
              </span>
              <span>AI-Powered Learning Platform</span>
            </Badge>
          </motion.div>

          <div className="max-w-screen-lg mx-auto text-center text-4xl md:text-6xl font-bold">
            <h1>
              Transform YouTube into
              <motion.span
                className="text-transparent px-2 bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text relative rainbow-text"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Structured Courses
              </motion.span>
              with AI
            </h1>
          </div>

          <p className="max-w-screen-sm mx-auto text-xl text-muted-foreground">
            Turn any YouTube playlist into an interactive learning experience. Track progress,
            take notes, and master new skills with AI-powered course generation.
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Button className="w-5/6 md:w-1/4 font-bold group/arrow">
              Create Your Course
              <ArrowRight className="size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="secondary"
              className="w-5/6 md:w-1/4 font-bold"
            >
              Watch Demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="relative group mt-14"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/50 rounded-full blur-3xl"></div>
          <img
            width={1200}
            height={1200}
            className="w-full md:w-[1200px] mx-auto rounded-lg relative rouded-lg leading-none flex items-center border border-t-2 border-secondary  border-t-primary/30"
            src={
              theme === "light"
                ? "/hero-image-light.jpeg"
                : "/hero-image-dark.jpeg"
            }
            alt="dashboard"
          />

          <div className="absolute bottom-0 left-0 w-full h-20 md:h-28 bg-gradient-to-b from-background/0 via-background/50 to-background rounded-lg"></div>
        </motion.div>
      </div>
    </section>
  );
}

interface BenefitsProps {
  icon: keyof typeof icons;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: "Sparkles",
    title: "AI-Powered Learning",
    description:
      "Our AI analyzes video content to create personalized learning paths and generate interactive quizzes.",
  },
  {
    icon: "Clock",
    title: "Save Time",
    description:
      "Skip the manual course creation process. Convert YouTube content into structured courses in minutes.",
  },
  {
    icon: "ChartBar",
    title: "Track Progress",
    description:
      "Monitor your learning journey with detailed analytics and progress tracking features.",
  },
  {
    icon: "LayoutGrid",
    title: "Organized Content",
    description:
      "Keep all your learning materials in one place with our intuitive course management system.",
  },
];

function BenefitsSection() {
  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div>
          <h2 className="text-lg text-primary mb-2 tracking-wider">Benefits</h2>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Learn Smarter, Not Harder
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Powered by Google's Gemini AI, our platform transforms how you learn from YouTube content.
            Get personalized learning experiences with smart content organization and interactive features.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 w-full">
          {benefitList.map(({ icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className="bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number
                relative overflow-hidden border border-primary/20 hover:border-primary"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent animate-gradient" />
                <CardHeader>
                  <div className="flex justify-between">
                    <Icon
                      name={icon as keyof typeof icons}
                      size={32}
                      color="hsl(var(--primary))"
                      className="mb-6 text-primary"
                    />
                    <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                      0{index + 1}
                    </span>
                  </div>

                  <CardTitle>{title}</CardTitle>
                </CardHeader>

                <CardContent className="text-muted-foreground">
                  {description}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeaturesProps {
  icon: string;
  title: string;
  description: string;
}

const featureList: FeaturesProps[] = [
  {
    icon: "Youtube",
    title: "YouTube Integration",
    description:
      "Import any YouTube video or playlist and automatically convert it into a structured course.",
  },
  {
    icon: "Brain",
    title: "AI Course Structure",
    description:
      "Our AI automatically generates chapters, summaries, and quizzes from video content.",
  },
  {
    icon: "Target",
    title: "Progress Tracking",
    description:
      "Track your learning progress, set goals, and earn certificates upon course completion.",
  },
  {
    icon: "PenTool",
    title: "Smart Notes",
    description:
      "AI-powered note-taking system that automatically organizes and summarizes key points.",
  },
  {
    icon: "Users",
    title: "Community Learning",
    description:
      "Join study groups, share notes, and collaborate with other learners in your course.",
  },
  {
    icon: "Smartphone",
    title: "Cross-Platform",
    description:
      "Access your courses anywhere with our mobile-friendly interface and offline viewing.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Features
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        What Makes Us Different
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        Experience the future of online learning with our Gemini-powered platform.
        We combine the best of YouTube's content with advanced AI to create an
        unmatched learning experience.
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ icon, title, description }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full bg-background border-0 shadow-none">
              <CardHeader className="flex justify-center items-center">
                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10 mb-4">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={24}
                    color="hsl(var(--primary))"
                    className="text-primary"
                  />
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground text-center">
                {description}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
enum ProService {
  YES = 1,
  NO = 0,
}
interface ServiceProps {
  title: string;
  pro: ProService;
  description: string;
}
const serviceList: ServiceProps[] = [
  {
    title: "Smart Course Generation",
    description: "AI-powered course structure and content organization from YouTube videos",
    pro: 0,
  },
  {
    title: "Progress Analytics",
    description: "Detailed learning analytics and progress tracking dashboard",
    pro: 0,
  },
  {
    title: "Community Features",
    description: "Join study groups and collaborate with other learners",
    pro: 1,
  },
  {
    title: "Advanced AI Tools",
    description: "Custom quizzes, summaries, and personalized learning paths",
    pro: 1,
  },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Services
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Grow Your Business
      </h2>
      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        Choose the plan that fits your learning journey. From basic course creation
        to advanced AI-powered features, we've got you covered.
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full lg:w-[60%] mx-auto">
        {serviceList.map(({ title, description, pro }) => (
          <Card
            key={title}
            className="bg-muted/60 dark:bg-card h-full relative"
          >
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <Badge
              data-pro={ProService.YES === pro}
              variant="secondary"
              className="absolute -top-2 -right-3 data-[pro=false]:hidden"
            >
              PRO
            </Badge>
          </Card>
        ))}
      </div>
    </section>
  );
};

interface ReviewProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
  rating: number;
}

const reviewList: ReviewProps[] = [
  {
    image: "https://github.com/shadcn.png",
    name: "Sarah Chen",
    userName: "Software Developer",
    comment:
      "The Gemini AI integration is incredible! It automatically created a structured course from my favorite coding tutorials, complete with quizzes and summaries.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Michael Rodriguez",
    userName: "Data Science Student",
    comment:
      "Game-changer for self-paced learning. The AI-generated chapter markers and key points help me stay focused and retain information better.",
    rating: 4.8,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Emily Watson",
    userName: "Online Educator",
    comment:
      "As a course creator, this platform has revolutionized how I organize content. The AI suggestions and learning path generation are spot-on!",
    rating: 4.9,
  },
  // ... you can update the remaining reviews similarly
];

export const TestimonialSection = () => {
  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          Testimonials
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
          Hear What Our 1000+ Clients Say
        </h2>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="relative w-[80%] sm:w-[90%] lg:max-w-screen-xl mx-auto"
      >
        <CarouselContent>
          {reviewList.map((review) => (
            <CarouselItem
              key={review.name}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <Card className="bg-muted/50 dark:bg-card">
                <CardContent className="pt-6 pb-0">
                  <div className="flex gap-1 pb-6">
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                  </div>
                  {`"${review.comment}"`}
                </CardContent>

                <CardHeader>
                  <div className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src="https://avatars.githubusercontent.com/u/75042455?v=4"
                        alt="radix"
                      />
                      <AvatarFallback>SV</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <CardTitle className="text-lg">{review.name}</CardTitle>
                      <CardDescription>{review.userName}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "How does the AI course generation work?",
    answer: "Our platform uses Google's Gemini AI to analyze YouTube videos, automatically generating structured chapters, summaries, and interactive quizzes. It identifies key concepts, creates timestamps, and organizes content into a logical learning path.",
    value: "item-1",
  },
  {
    question: "Can I use any YouTube video for course creation?",
    answer: "Yes! You can use any public YouTube video or playlist. Our AI works best with educational content, tutorials, and lectures. We recommend videos with clear speech and structured content for optimal results.",
    value: "item-2",
  },
  {
    question: "What makes your platform different from regular YouTube playlists?",
    answer: "Unlike regular playlists, we offer AI-powered features like automatic chapter generation, smart summaries, progress tracking, interactive quizzes, and a collaborative learning environment. Our Gemini AI helps create a more engaging and effective learning experience.",
    value: "item-3",
  },
  {
    question: "How accurate is the AI-generated content?",
    answer: "Our Gemini-powered AI achieves high accuracy in content analysis and organization. However, you can always edit and customize the generated content to better suit your needs.",
    value: "item-4",
  },
  {
    question: "Do you offer offline access to courses?",
    answer: "Yes, premium users can download course materials, including AI-generated summaries and quizzes, for offline access through our mobile app.",
    value: "item-5",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="container md:w-[700px] py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          FAQS
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold">
          Common Questions
        </h2>
      </div>

      <Accordion type="single" collapsible className="AccordionRoot">
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export const FooterSection = () => {
  return (
    <footer id="footer" className="container py-24 sm:py-32">
      <div className="p-10 bg-card border border-secondary rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
          <div className="col-span-full xl:col-span-2">
            <Link to="#" className="flex font-bold items-center">
              <ChevronsDownIcon className="w-9 h-9 mr-2 bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg border border-secondary" />

              <h3 className="text-2xl">Shadcn</h3>
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Contact</h3>
            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                Github
              </Link>
            </div>

            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                Twitter
              </Link>
            </div>

            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                Instagram
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Platforms</h3>
            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                iOS
              </Link>
            </div>

            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                Android
              </Link>
            </div>

            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                Web
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Help</h3>
            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                Contact Us
              </Link>
            </div>

            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                FAQ
              </Link>
            </div>

            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                Feedback
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Socials</h3>
            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                Twitch
              </Link>
            </div>

            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                Discord
              </Link>
            </div>

            <div>
              <Link to="#" className="opacity-60 hover:opacity-100">
                Dribbble
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-6" />
        <section className="">
          <h3 className="">
            &copy; 2024 Designed and developed by
            <Link
              target="_blank"
              to="https://github.com/leoMirandaa"
              className="text-primary transition-all border-primary hover:border-b-2 ml-1"
            >
              Leo Miranda
            </Link>
          </h3>
        </section>
      </div>
    </footer>
  );
};
