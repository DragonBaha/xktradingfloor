import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function CTASection() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div> */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* <div className="rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-400/10 border border-blue-900/40 text-center p-10 shadow-lg shadow-blue-500/20"> */}
        <div className="rounded-2xl bg-gray-900 border border-gray-800 text-center p-10">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6 leading-tight"
          >
            Join thousands of traders <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">mastering the markets</span>.
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-300 font-medium mb-8"
          >
            Access events, courses, reviews, and an active community.
          </motion.p>
          <Link to="/signup" className="btn inline-flex items-center justify-center rounded-full bg-white text-gray-900 hover:bg-gray-100 border-2 border-white hover:scale-105 transition-all shadow-lg px-6 py-3 font-medium">
            Sign Up Now
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export default CTASection;


