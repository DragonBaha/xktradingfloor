import React from "react";
import HeroSection from "../components/shared/HeroSection.jsx";
import SectionHeader from "../components/shared/SectionHeader.jsx";
import InfoCard from "../components/shared/InfoCard.jsx";
import AnimatedDivider from "../components/shared/AnimatedDivider.jsx";
import { Rocket, ShieldCheck, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import ImageWithFallback from "../components/shared/ImageWithFallback.jsx";
import { Link } from "react-router-dom";

// Default about data
const DEFAULT_ABOUT_DATA = {
  name: "Sahil",
  designation: "Founder",
  description: "Passionate about empowering traders through education and technology. Building XK Trading Floor to create a transparent and supportive trading community.",
  image: "/assets/leadership/Sahil.png",
};

function getAboutData() {
  if (typeof window === "undefined") return DEFAULT_ABOUT_DATA;
  try {
    const stored = localStorage.getItem("xk_about_data");
    if (stored) {
      return { ...DEFAULT_ABOUT_DATA, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Error loading about data:", error);
  }
  return DEFAULT_ABOUT_DATA;
}

function About() {
  const [aboutData, setAboutData] = React.useState(DEFAULT_ABOUT_DATA);

  React.useEffect(() => {
    setAboutData(getAboutData());
  }, []);

  // Listen for storage changes (when admin updates about section)
  React.useEffect(() => {
    const handleStorageChange = () => {
      setAboutData(getAboutData());
    };
    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for same-tab updates
    const interval = setInterval(() => {
      setAboutData(getAboutData());
    }, 1000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-black min-h-screen">
      <Helmet>
        <title>About | XK Trading Floor</title>
        <meta
          name="description"
          content="Learn about XK Trading Floor's mission to empower traders through education, data, and community."
        />
        <link rel="canonical" href="/about" />
        <meta property="og:title" content="About | XK Trading Floor" />
        <meta
          property="og:description"
          content="Empowering traders through technology and data."
        />
      </Helmet>

      <HeroSection
        title={<>About <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">XK Trading Floor</span></>}
        subtitle="Empowering traders through technology, data, and a transparent community."
        buttonText="Explore Our Mission"
        scrollTo="#mission"
      />

      <section
        id="mission"
        className="py-20 bg-black relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-3">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">Vision</span> & Mission
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
              What drives us every day
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard icon={Rocket} title="Innovation">
              We build learning and review experiences that leverage modern UX and
              real-world practice.
            </InfoCard>
            <InfoCard icon={ShieldCheck} title="Integrity">
              Transparent reviews and honest insights to help traders make
              informed decisions.
            </InfoCard>
            <InfoCard icon={Users} title="Empowerment">
              A supportive community where traders learn, collaborate, and grow
              together.
            </InfoCard>
          </div>
          <AnimatedDivider />
        </div>
      </section>

      {/* Founder Section - Modern Sleek Redesign */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Modern Layout: Image and Content Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
              {/* Image Section - Left Side (2 columns on large screens) */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2 relative"
              >
                <div className="relative group">
                  {/* Subtle background glow */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Image container with elegant border */}
                  <div className="relative rounded-2xl overflow-hidden border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-2">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={aboutData.image}
                        fallback="/assets/placeholder.jpg"
                        alt={aboutData.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Subtle overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                  </div>
                  
                  {/* Decorative accent */}
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-2xl"></div>
                </div>
              </motion.div>

              {/* Content Section - Right Side (3 columns on large screens) */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:col-span-3 space-y-6"
              >
                {/* Header */}
                <div className="space-y-2">
                  <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight">
                    <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                      {aboutData.name}
                    </span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-400 font-medium">
                    {aboutData.designation}
                  </p>
                </div>

                {/* Description Content */}
                <div className="text-sm sm:text-base text-gray-300 leading-relaxed space-y-4">
                  <p>
                    Sahil discovered Forex trading in 2020 while searching for a skill that could create real freedom. What began as curiosity quickly became years of studying charts, blowing accounts, learning strategies, and understanding the mindset behind successful traders.
                  </p>
                  <p>
                    In those early years, Sahil worked as a Forex Market Analyst, helping new traders avoid the mistakes he once made. But he realized something deeper — <span className="font-semibold text-blue-300">Most traders fail not because they lack skill, but because they lack guidance and honest information.</span>
                  </p>
                  <p>
                    That insight sparked the idea for XK Trading Floor.
                  </p>
                  <p>
                    In 2023, he began building a platform focused on transparency, real conversations, and genuine education. To learn directly from those ahead of him, Sahil started documenting his entire journey on YouTube and sat down with prop firm owners, successful traders, and industry experts, asking the questions he wished he had answers to when he started.
                  </p>
                  <p>
                    Then came 2025 — the year everything changed. Sahil earned his first prop firm payouts and made money solely through trading, marking his first official year as a profitable trader. It was the moment that validated every setback, every late night, and every step of growth.
                  </p>
                  
                  {/* Highlight Box */}
                  <div className="relative mt-6 p-5 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 backdrop-blur-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-xl"></div>
                    <div className="pl-4">
                      <p className="font-semibold text-gray-200 mb-3 text-sm sm:text-base">Today, XK Trading Floor is becoming a trusted hub for:</p>
                      <ul className="space-y-2.5">
                        <li className="flex items-start gap-3">
                          <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-sm sm:text-base">Honest broker & prop firm reviews</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-sm sm:text-base">Educational tools and content</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-sm sm:text-base">Real conversations with real traders</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-sm sm:text-base">A supportive community focused on growth</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="font-semibold text-gray-200 text-base sm:text-lg">
                    Sahil's mission is simple: to create a transparent trading ecosystem where traders learn, grow, and evolve together.
                  </p>
                  <p className="text-gray-400 italic text-xs sm:text-sm">
                    And this is still only the beginning — for him, for XK Trading Floor, and for every trader choosing to walk this journey.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 overflow-hidden"
          >
            <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">Join Our Network</h3>
                <p className="text-sm sm:text-base text-gray-300">
                  Become part of a growing, supportive trading community.
                </p>
              </div>
              <Link
                to="/academy"
                className="btn inline-flex items-center justify-center rounded-full bg-white text-gray-900 hover:bg-gray-100 border-2 border-white hover:scale-105 transition-all shadow-lg px-6 py-3 font-medium whitespace-nowrap"
                aria-label="Explore Academy"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default About;
