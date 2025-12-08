import React, { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  UserPlus,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import ImageWithFallback from "../shared/ImageWithFallback.jsx";

const steps = [
  {
    id: 1,
    number: "01",
    mainTitle: "Create an Account on XK Trading Floor",
    title: "Join XK Trading Floor & Unlock Your Trader's Hub",
    description:
      "Start by signing up on XK Trading Floor. Gain access to reviews, blogs, events, and community tools built for traders.",
    image: "/assets/create_account.jpg",
    ctaText: "Get Started",
    ctaLink: "/signup",
    color: "blue",
  },
  {
    id: 2,
    number: "02",
    mainTitle: "Connect & Grow",
    title: "Join the Community",
    description:
      "Follow us on socials, watch our podcast, and connect with traders across the XKTF community.",
    image: "/assets/follow_socials.jpg",
    ctaText: "Follow Us",
    ctaLink: "/contact",
    color: "green",
  },
  {
    id: 3,
    number: "03",
    mainTitle: "Share Your Journey & Explore",
    title: "Share Your Journey & Explore",
    description:
      "Write your trading story, publish blogs, review brokers and prop firms, and discover trading events happening around the world.",
    image: "/assets/join_academy.jpg",
    ctaText: "Join Discord",
    ctaLink: "/contact",
    color: "purple",
  },
];

function StepCard({ step, index, isInView }) {
  const colorClasses = {
    blue: {
      gradient: "from-blue-600/80 to-transparent",
      text: "text-blue-400",
      button: "bg-blue-500 hover:bg-blue-600",
    },
    green: {
      gradient: "from-green-600/80 to-transparent",
      text: "text-green-400",
      button: "bg-green-500 hover:bg-green-600",
    },
    purple: {
      gradient: "from-purple-600/80 to-transparent",
      text: "text-purple-400",
      button: "bg-purple-500 hover:bg-purple-600",
    },
  };

  const colors = colorClasses[step.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="flex-shrink-0 w-full md:w-[450px] lg:w-[500px]"
    >
      <div className="relative h-[400px] rounded-xl overflow-hidden group cursor-pointer">
        {/* Background Image */}
        <ImageWithFallback
          src={step.image}
          fallback="/assets/placeholder.jpg"
          alt={step.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay - Dark to Light from Left to Right */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${colors.gradient}`}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6">
          <div>
            {/* Number - Big, same size */}
            <div
              className={`text-5xl sm:text-6xl font-extrabold ${colors.text} mb-3 leading-none`}
            >
              {step.number}
            </div>
            {/* Main Title - Smaller than number, bold */}
            {step.mainTitle && (
              <h3 className="font-display font-bold text-lg sm:text-xl lg:text-2xl tracking-tight mb-2 text-white">
                {step.mainTitle}
              </h3>
            )}
            {/* Title - Smaller than mainTitle, italic */}
            <h4 className="font-display font-normal italic text-sm sm:text-base lg:text-lg tracking-tight mb-3 text-gray-200">
              {step.title}
            </h4>
            {/* Description - Normal text */}
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {step.description}
            </p>
          </div>

          <Link
            to={step.ctaLink}
            className={`${colors.button} text-white px-6 py-3 rounded-full font-medium w-fit transition-all hover:scale-105 shadow-lg`}
          >
            {step.ctaText}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function HowItWorks() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const scrollContainerRef = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const cardWidth =
        scrollContainerRef.current.querySelector(".flex-shrink-0")
          ?.offsetWidth || 500;
      const scrollPosition = index * (cardWidth + 24);
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const scrollLeft = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const scrollRight = () => {
    if (currentIndex < steps.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const cardWidth =
          scrollContainerRef.current.querySelector(".flex-shrink-0")
            ?.offsetWidth || 500;
        const index = Math.round(scrollLeft / (cardWidth + 24));
        setCurrentIndex(index);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-black relative overflow-hidden"
    >
      {/* Background decorations */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-4 leading-tight"
          >
            How <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">Does It Work?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto"
          >
            Follow these simple steps to start your journey with XK Trading Floor — learn, connect, and grow as a trader.
          </motion.p>
        </motion.div>

        {/* Desktop: Horizontal Scroll */}
        <div className="hidden md:block relative">
          {/* Navigation Arrows */}
          <button
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-gray-800/90 backdrop-blur-sm border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-all ${
              currentIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-110"
            }`}
            aria-label="Previous step"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={scrollRight}
            disabled={currentIndex === steps.length - 1}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-gray-800/90 backdrop-blur-sm border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-all ${
              currentIndex === steps.length - 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-110"
            }`}
            aria-label="Next step"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-blue-500"
                    : "w-2 bg-gray-700 hover:bg-gray-600"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile: Vertical Stack */}
        <div className="md:hidden space-y-6">
          {steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

export default HowItWorks;
