import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAssetPath } from '../../utils/assets.js';

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
            className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-6 leading-tight"
          >
            Find the Best <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">Brokers, Prop Firms & Academies</span> — All in One Place
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm sm:text-base text-gray-300 mb-8 space-y-3 leading-relaxed"
          >
            <p>
              Compare verified brokers and prop firms, find real trading education, and join India's most active trading community.
            </p>
            <p>
              Earn rebates, rewards, and knowledge - all under one platform.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link to="/reviews" className="btn rounded-full btn-primary bg-white text-gray-900 hover:bg-gray-100 border-2 border-white hover:scale-105 transition-all shadow-lg px-6 py-3">
              Find the Right Broker
            </Link>
            <Link to="/academy" className="btn rounded-full btn-secondary border-2 border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800 text-white hover:scale-105 transition-all px-6 py-3">
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
            {/* Logo - Center with Ripple Effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute z-30 flex items-center justify-center"
            >
              <motion.img
                src={getAssetPath("/assets/logo.png")}
                alt="XK Trading Floor Logo"
                className="h-64 w-48 md:h-80 md:w-60 lg:h-96 lg:w-72 object-contain drop-shadow-2xl"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Inner Circle - Ripple 1 */}
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute h-64 w-64 border-2 border-blue-400/50 rounded-full"
            />

            {/* Outer Circle - Ripple 2 */}
            <motion.div
              animate={{ 
                scale: [1, 1.8, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ 
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute h-96 w-96 border-2 border-blue-400/40 rounded-full"
            />

            {/* Additional Ripple Layer */}
            <motion.div
              animate={{ 
                scale: [1, 2.2, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute h-[500px] w-[500px] border border-blue-400/30 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;


