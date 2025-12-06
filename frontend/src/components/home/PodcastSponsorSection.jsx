import React from "react";
import { motion } from "framer-motion";
import { User, Mic, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import ImageWithFallback from "../shared/ImageWithFallback.jsx";

function PodcastSponsorSection() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6 leading-tight"
          >
            Shaping the Future of Finance,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
              One Conversation at a Time
            </span>
            .
          </motion.h2>
        </motion.div>

        {/* Two Column Layout - Reversed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Left Card - Sponsor YouTube */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="card p-6 hover:scale-[1.02] transition-transform duration-300 bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-gray-900 border-blue-500/30 relative overflow-hidden"
          >
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent"></div>
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Youtube className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight text-white">
                  Sponsor our youtube channels
                </h3>
              </div>
              
              <p className="text-base sm:text-lg text-gray-300 font-medium mb-6 flex-grow">
                Elevate your brand's visibility by sponsoring our YouTube channel with thousands of engaged viewers worldwide.
              </p>
              
              <Link
                to="/contact"
                className="btn inline-flex items-center justify-center gap-2 rounded-full bg-white text-gray-900 hover:bg-gray-100 border-2 border-white hover:scale-105 transition-all shadow-lg px-5 py-2.5 text-sm font-medium mb-4"
              >
                <User className="h-4 w-4" />
                <span>Contact us</span>
              </Link>

              {/* YouTube Channel Preview Mockup */}
              <div className="relative rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-900/50 backdrop-blur-sm">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                  {/* Channel Header Mockup */}
                  <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-600/20 to-transparent border-b border-gray-700">
                    <div className="p-4">
                      <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
                    </div>
                  </div>
                  
                  {/* Video Grid Mockup */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div
                        key={item}
                        className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded border border-gray-600 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Youtube className="h-4 w-4 text-blue-400" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-900/80 backdrop-blur-sm">
                          <div className="h-2 bg-gray-700/50 rounded w-2/3 mx-1 mt-1"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Channel Stats Overlay */}
                  <div className="absolute top-24 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-gray-700 border-2 border-gray-600"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-700/50 rounded w-32 mb-1"></div>
                        <div className="h-2 bg-gray-700/30 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Card - Join Podcast */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="card p-6 hover:scale-[1.02] transition-transform duration-300 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 relative overflow-hidden"
          >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Mic className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight text-white">
                  Join our Podcast!
                </h3>
              </div>
              
              <p className="text-base sm:text-lg text-gray-300 font-medium mb-6 flex-grow">
                Interested in joining our podcast as a guest? Fill out the form to request your spot.
              </p>
              
              <Link
                to="/contact"
                className="btn inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-500 hover:border-blue-600 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 px-5 py-2.5 text-sm mb-4"
              >
                <User className="h-4 w-4" />
                <span>Contact us</span>
              </Link>

              {/* Podcast Image/Visual */}
              <div className="relative rounded-lg overflow-hidden border-2 border-gray-700">
                <ImageWithFallback
                  src="/assets/podcasts/episode1.jpg"
                  fallback="/assets/placeholder.jpg"
                  alt="Podcast Recording"
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent flex items-center justify-center">
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-blue-500/20 backdrop-blur-sm border-4 border-blue-400/30 flex items-center justify-center">
                      <Mic className="h-10 w-10 text-blue-400" />
                    </div>
                  </div>
                  {/* Decorative sound waves */}
                  <div className="absolute bottom-4 left-0 right-0 flex items-end justify-center gap-1 h-12">
                    {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                      <div
                        key={item}
                        className="w-1 bg-blue-400/40 rounded-full"
                        style={{
                          height: `${20 + item * 8}px`,
                          animation: `pulse ${1 + item * 0.1}s ease-in-out infinite`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PodcastSponsorSection;

