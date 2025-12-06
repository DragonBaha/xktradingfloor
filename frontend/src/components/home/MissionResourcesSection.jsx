import React from "react";
import { motion } from "framer-motion";
import { Play, GraduationCap, Mic, User } from "lucide-react";
import { Link } from "react-router-dom";
import ImageWithFallback from "../shared/ImageWithFallback.jsx";

function MissionResourcesSection() {
  const youtubeVideos = [
    {
      id: "3Autqvt8yFE",
      url: "https://youtu.be/3Autqvt8yFE?si=eCP5KZVzQ5MbW1-W",
      thumbnail: "https://img.youtube.com/vi/3Autqvt8yFE/maxresdefault.jpg",
    },
    {
      id: "_B67GB5jPSY",
      url: "https://youtu.be/_B67GB5jPSY?si=-Gvz9umpNegv7Xdh",
      thumbnail: "https://img.youtube.com/vi/_B67GB5jPSY/maxresdefault.jpg",
    },
    {
      id: "CZOc7hvLDJc",
      url: "https://youtu.be/CZOc7hvLDJc?si=45crT1kknfafXq3s",
      thumbnail: "https://img.youtube.com/vi/CZOc7hvLDJc/maxresdefault.jpg",
    },
    {
      id: "TCK6PqGEflQ",
      url: "https://youtu.be/TCK6PqGEflQ?si=mxY7E0Rg4qa-5a5p",
      thumbnail: "https://img.youtube.com/vi/TCK6PqGEflQ/maxresdefault.jpg",
    },
  ];

  const additionalVideos = [
    {
      id: "v8kzN1NiFZ4",
      url: "https://youtu.be/v8kzN1NiFZ4?si=XePHikhJDf7Mo01q",
      thumbnail: "https://img.youtube.com/vi/v8kzN1NiFZ4/maxresdefault.jpg",
    },
    {
      id: "VQAvDRi-5P8",
      url: "https://youtu.be/VQAvDRi-5P8?si=NKMUGpMTGOMus7C8",
      thumbnail: "https://img.youtube.com/vi/VQAvDRi-5P8/maxresdefault.jpg",
    },
    {
      id: "am0lGroRgqk",
      url: "https://youtu.be/am0lGroRgqk?si=ooFowOVaqnQbKF3A",
      thumbnail: "https://img.youtube.com/vi/am0lGroRgqk/maxresdefault.jpg",
    },
    {
      id: "WqF2QmmhbHY",
      url: "https://youtu.be/WqF2QmmhbHY?si=V1mfsMD0vx7BrXRn",
      thumbnail: "https://img.youtube.com/vi/WqF2QmmhbHY/maxresdefault.jpg",
    },
  ];

  // Duplicate videos for seamless marquee
  const duplicatedVideos = [...youtubeVideos, ...youtubeVideos];
  const duplicatedAdditionalVideos = [...additionalVideos, ...additionalVideos];

  // Guest images
  const guestImages = [
    "/assets/guests/Guest1.png",
    "/assets/guests/Guest2.png",
    "/assets/guests/Guest3.png",
    "/assets/guests/Guest4.png",
    "/assets/guests/Guest5.png",
    "/assets/guests/Guest6.png",
  ];

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Mission Statement */}
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
            Our Mission is to Deliver The Best{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
              FREE Actionable Value
            </span>{" "}
            For Traders of ALL Experience Levels!
          </motion.h2>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Left Card - YouTube Channel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="card p-6 hover:scale-[1.02] transition-transform duration-300 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 flex flex-col items-center text-center"
          >
            <h3 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight text-white mb-4 leading-tight">
              XK Trading Floor
              <br />
              <span className="bg-gradient-to-r from-red-400 via-red-300 to-red-500 bg-clip-text text-transparent">
                Youtube Channel
              </span>
            </h3>
            <p className="text-base sm:text-lg text-gray-300 mb-6 font-medium max-w-md">
              The Biggest Collection of Verified Traders In The World. Covering
              Their Trading Processes, Psychology, How They Handle Risk, How
              They Scaled Capital & So Much More!
            </p>
            <a
              href="https://www.youtube.com/@xk_trading_floor"
              target="_blank"
              rel="noopener noreferrer"
              className="btn inline-flex items-center justify-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 hover:border-red-700 hover:scale-105 transition-all shadow-lg shadow-red-500/20 mb-4 px-5 py-2.5 text-sm"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              <span>Youtube Channel</span>
            </a>

            {/* First Marquee Video Thumbnails - Horizontal/Rectangular (Right to Left) */}
            <div className="relative overflow-hidden rounded-lg w-full mb-3">
              <div
                className="flex gap-3"
                style={{
                  animation: "marquee 25s linear infinite",
                  width: "fit-content",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.animationPlayState = "paused")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.animationPlayState = "running")
                }
              >
                {duplicatedVideos.map((video, index) => (
                  <a
                    key={`${video.id}-${index}`}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group cursor-pointer flex-shrink-0 w-56 h-32 rounded-lg overflow-hidden"
                  >
                    <ImageWithFallback
                      src={video.thumbnail}
                      fallback="/assets/placeholder.jpg"
                      alt={`Video ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                        <Play
                          className="h-6 w-6 text-white ml-0.5"
                          fill="white"
                        />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Second Marquee Video Thumbnails - Horizontal/Rectangular (Left to Right) */}
            <div className="relative overflow-hidden rounded-lg w-full">
              <div
                className="flex gap-3"
                style={{
                  animation: "marquee-reverse 25s linear infinite",
                  width: "fit-content",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.animationPlayState = "paused")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.animationPlayState = "running")
                }
              >
                {duplicatedAdditionalVideos.map((video, index) => (
                  <a
                    key={`${video.id}-${index}`}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group cursor-pointer flex-shrink-0 w-56 h-32 rounded-lg overflow-hidden"
                  >
                    <ImageWithFallback
                      src={video.thumbnail}
                      fallback="/assets/placeholder.jpg"
                      alt={`Video ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                        <Play
                          className="h-6 w-6 text-white ml-0.5"
                          fill="white"
                        />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Card - Academy */}
          {/* <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="card p-6 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 flex flex-col items-center text-center"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-green-500/10 via-blue-500/5 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-green-500/5 to-transparent opacity-50"></div>

            <div className="relative z-10 w-full flex flex-col items-center">
              <h3 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight text-white mb-4 leading-tight">
                XK Trading Floor.
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                  Profitable Strategies
                </span>
              </h3>
              <p className="text-base sm:text-lg text-gray-300 mb-6 font-medium max-w-md">
                XK Trading Floor Dives Deep Into Verified Traders' Play Books,
                Passionately Sharing Their Exact Processes That Make Them 6, 7,
                and 8 Figures In The Markets — All For FREE!
              </p>
              <Link
                to="/academy"
                className="btn inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-500 hover:border-blue-600 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 mb-4 px-5 py-2.5 text-sm"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Academy</span>
              </Link>

              <div className="grid grid-cols-3 gap-3 w-full">
                {guestImages.map((guestImage, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="aspect-square rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-300"
                  >
                    <ImageWithFallback
                      src={guestImage}
                      fallback="/assets/placeholder.jpg"
                      alt={`Guest ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div> */}

          {/* Right Card - Join Podcast */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="card p-6 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 flex flex-col items-center text-center"
          >
            {/* Subtle gradient decoration with wavy effect */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-blue-500/5 to-transparent opacity-50"></div>

            <div className="relative z-10 w-full flex flex-col items-center">
              <h3 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight text-white mb-4 leading-tight">
                Join our
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                  Podcast!
                </span>
              </h3>
              <p className="text-base sm:text-lg text-gray-300 mb-6 font-medium max-w-md">
                Interested in joining our podcast as a guest? Fill out the form to request your spot.
              </p>
              <Link
                to="/contact"
                className="btn inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-500 hover:border-blue-600 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 mb-4 px-5 py-2.5 text-sm"
              >
                <User className="h-4 w-4" />
                <span>Contact us</span>
              </Link>

              {/* Podcast Image/Visual */}
              <div className="relative rounded-lg overflow-hidden border-2 border-gray-700 w-full">
                <ImageWithFallback
                  src="/assets/podcast.png"
                  fallback="/assets/placeholder.jpg"
                  alt="Podcast Recording"
                  className="w-full aspect-video object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default MissionResourcesSection;
