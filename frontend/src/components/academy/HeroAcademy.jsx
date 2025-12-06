import React from 'react';
import { motion } from 'framer-motion';

function HeroAcademy() {
  const scrollToEvents = () => {
    const el = document.getElementById('academy-events');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative overflow-hidden bg-black">
      {/* <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" /> */}
      {/* <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" /> */}
      {/* <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl"
        >
          Master the Markets with Expert-Led Programs
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-gray-300 max-w-3xl mx-auto"
        >
          Live workshops, strategy sessions, and trading bootcamps.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={scrollToEvents}
          className="btn btn-primary rounded-full mt-6 opacity-100 visible"
          style={{ visibility: 'visible', opacity: 1 }}
        >
          Join an Event
        </motion.button>
      </div>
    </section>
  );
}

export default HeroAcademy;


