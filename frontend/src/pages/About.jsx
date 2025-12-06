import React from "react";
import HeroSection from "../components/shared/HeroSection.jsx";
import SectionHeader from "../components/shared/SectionHeader.jsx";
import InfoCard from "../components/shared/InfoCard.jsx";
import AnimatedDivider from "../components/shared/AnimatedDivider.jsx";
import { Rocket, ShieldCheck, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import ImageWithFallback from "../components/shared/ImageWithFallback.jsx";

// Default about data
const DEFAULT_ABOUT_DATA = {
  name: "Sahil",
  designation: "Founder",
  description: "Passionate about empowering traders through education and technology. Building XK Trading Floor to create a transparent and supportive trading community.",
  image: "/assets/leadership/leader-2.jpg",
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
        title="About XK Trading Floor"
        subtitle="Empowering traders through technology, data, and a transparent community."
        buttonText="Explore Our Mission"
        scrollTo="#mission"
      />

      <section
        id="mission"
        className="py-20 bg-black relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          title="Vision & Mission"
          subtitle="What drives us every day"
        />
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

      {/* Founder Section - Professional Layout */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="card-body p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Section - Left */}
              <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 lg:p-12 flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
                  <ImageWithFallback
                    src={aboutData.image}
                    fallback="/assets/placeholder.jpg"
                    alt={aboutData.name}
                    className="relative w-full h-auto rounded-2xl object-cover shadow-2xl border-4 border-white/10"
                  />
                </div>
              </div>

              {/* Content Section - Right */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      {aboutData.name}
                    </h2>
                    <p className="text-xl text-gray-300 font-medium">
                      {aboutData.designation}
                    </p>
                  </div>
                  
                  {aboutData.description && (
                    <div 
                      className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: aboutData.description }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </section>

      <section className="py-20 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="card bg-gray-900/60 border border-border">
          <div className="card-body flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Join Our Network</h3>
              <p className="text-sm text-gray-400">
                Become part of a growing, supportive trading community.
              </p>
            </div>
            <a
              href="/academy"
              className="btn btn-primary bg-blue-600 hover:bg-blue-700 transition-all"
              aria-label="Explore Academy"
            >
              Get Started
            </a>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}

export default About;
