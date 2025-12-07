import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getAssetPath } from "../../utils/assets.js";

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Animated background gradients */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black" /> */}
      {/* <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
      /> */}
      {/* <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"
      /> */}
      {/* <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-green-500/5 blur-3xl"
      /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight mb-6 leading-tight"
          >
            <span className="text-white">A Transparent</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">
              Trading
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">
              Community
            </span>
            <br />
            <span className="text-white">Built by Traders</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl"
          >
            Share your journey, read honest reviews, discover trading events,
            and learn from real traders — all in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link
              to="/reviews"
              className="btn rounded-full btn-primary bg-white text-gray-900 hover:bg-gray-100 border-2 border-white hover:scale-105 transition-all shadow-lg px-6 py-3"
            >
              Find the Right Broker
            </Link>
            <Link
              to="/academy"
              className="btn rounded-full btn-secondary border-2 border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800 text-white hover:scale-105 transition-all px-6 py-3"
            >
              Join XK Trading Floor
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center justify-center relative"
        >
          <div className="relative h-96 w-96 flex items-center justify-center">
            {/* Main Circular Border */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute h-96 w-96 border border-gray-700/50 rounded-full flex items-center justify-center"
            >
              {/* Logo - Center */}
              <motion.div
                className="flex items-center justify-center"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img
                  src={getAssetPath("/assets/logo.png")}
                  alt="XK Trading Floor Logo"
                  className="h-48 w-48 md:h-64 md:w-64 lg:h-80 lg:w-80 object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </motion.div>
            </motion.div>

            {/* Subtle Ripple Effect - Optional */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute h-96 w-96 border border-gray-600/20 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
