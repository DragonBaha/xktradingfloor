import React from "react";
import { motion } from "framer-motion";

function WhatIsXK() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-4"
          >
            What is XK Trading Floor?
          </motion.h3>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-6 leading-tight"
          >
            It's More Than a Trading Community —{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">
              It's a Traders' Ecosystem.
            </span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm sm:text-base text-gray-300 max-w-4xl mx-auto space-y-3 leading-relaxed"
          >
            <p>
              XK Trading Floor is a growing ecosystem built for traders who want to learn, grow, and earn — all in one place.
            </p>
            <p>
              Explore and test strategies, discover top brokers, prop firms, and academies, and stay ahead with the latest tools, podcasts, and events designed for traders who take their craft seriously.
            </p>
            <p>
              Join a community that believes in real results, transparency, and growth through collaboration.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default WhatIsXK;
