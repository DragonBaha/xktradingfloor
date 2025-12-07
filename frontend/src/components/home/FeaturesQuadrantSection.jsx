import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  MessageSquare, 
  BookOpen, 
  Globe,
  Youtube,
  Instagram,
  Linkedin,
  Twitter,
  ArrowRight
} from "lucide-react";

function FeaturesQuadrantSection() {
  const features = [
    {
      id: 1,
      icon: BarChart3,
      title: "Build a market mindset",
      description: "XK Trading Floor teaches you how to use psychology to read the market like a pro and build your own winning strategy through real-world analysis and insights.",
      buttonText: "Watch free analysis now",
      buttonLink: "https://www.youtube.com/@xk_trading_floor",
      isExternal: true,
    },
    {
      id: 2,
      icon: MessageSquare,
      title: "1:1 mentorship sessions",
      description: "Every trader is different. With 1:1 mentorship, you get tailored strategies, direct feedback, and hands-on coaching to refine your trading game.",
      buttonText: "Book a 1:1 session",
      buttonLink: "/contact",
      isExternal: false,
    },
    {
      id: 3,
      icon: BookOpen,
      title: "Courses that actually teach",
      description: "Courses are structured to take you from beginner to pro with step-by-step lessons designed for real-world trading analysis and execution.",
      buttonText: "Explore courses",
      buttonLink: "/academy",
      isExternal: false,
    },
    {
      id: 4,
      icon: Globe,
      title: "A community that supports you",
      description: "XK Trading Floor has a strong community who help each other grow. Join exclusive groups, engage in discussions, and stay ahead of market trends.",
      isCommunity: true,
    },
  ];

  const socialLinks = [
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://www.youtube.com/@xk_trading_floor",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      hoverBg: "group-hover:bg-red-500/30",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/xktradingfloor/",
      color: "text-pink-400",
      bgColor: "bg-pink-500/20",
      hoverBg: "group-hover:bg-pink-500/30",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://www.linkedin.com/company/xk-trading-floor",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      hoverBg: "group-hover:bg-blue-500/30",
    },
    {
      name: "X",
      icon: Twitter,
      url: "https://x.com/XK_Capital",
      color: "text-gray-400",
      bgColor: "bg-gray-500/20",
      hoverBg: "group-hover:bg-gray-500/30",
    },
  ];

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Grid Layout - 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const isCommunity = feature.isCommunity;
            
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6 lg:p-8 hover:scale-[1.02] transition-transform duration-300 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 relative overflow-hidden min-h-[280px] flex flex-col"
              >
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <IconComponent className="h-5 w-5 lg:h-6 lg:w-6 text-blue-400" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-base sm:text-lg lg:text-xl tracking-tight text-white mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-300 mb-6 flex-grow leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Button or Community Section */}
                  {isCommunity ? (
                    <div>
                      <p className="text-sm sm:text-base text-white mb-4">
                        Join the community
                      </p>
                      <div className="flex items-center gap-3">
                        {socialLinks.map((social) => {
                          const SocialIcon = social.icon;
                          return (
                            <a
                              key={social.name}
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`group flex items-center justify-center h-10 w-10 lg:h-12 lg:w-12 rounded-full ${social.bgColor} ${social.hoverBg} border border-gray-700 hover:border-blue-500 transition-all`}
                              aria-label={social.name}
                            >
                              <SocialIcon className={`h-5 w-5 lg:h-6 lg:w-6 ${social.color}`} />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <>
                      {feature.isExternal ? (
                        <a
                          href={feature.buttonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-500 hover:border-blue-600 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 px-5 py-2.5 text-sm font-medium w-fit"
                        >
                          <span>{feature.buttonText}</span>
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link
                          to={feature.buttonLink}
                          className="btn inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-500 hover:border-blue-600 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 px-5 py-2.5 text-sm font-medium w-fit"
                        >
                          <span>{feature.buttonText}</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesQuadrantSection;

