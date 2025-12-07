import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../shared/ImageWithFallback.jsx';

function CommunitySection() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-6 leading-tight"
            >
              Trade, Learn & Grow — <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">Together.</span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm sm:text-base text-gray-300 mb-8 space-y-4 leading-relaxed"
            >
              <p>
                Looking for a community that helps you master trading — not just technicals, but mindset and strategy too?
              </p>
              <p>
                At XK Trading Floor, we've built a supportive, non-toxic space where traders share insights, discuss markets, and grow collectively.
              </p>
              <p>
                Whether you're new or experienced, you'll find a team ready to help you reach the next level.
              </p>
            </motion.div>
            <Link to="/academy" className="btn inline-flex items-center justify-center rounded-full bg-white text-gray-900 hover:bg-gray-100 border-2 border-white hover:scale-105 transition-all shadow-lg px-6 py-3 font-medium">
              Join the Community
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            {/* Seamless glow effect */}
            {/* <motion.div
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 rounded-3xl blur-2xl -z-10"
            /> */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
              <ImageWithFallback
                src="/assets/community_trading.jpg"
                fallback="/assets/placeholder.jpg"
                alt="Community trading platform"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CommunitySection;

