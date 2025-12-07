import React from 'react';
import { motion } from 'framer-motion';

function MerchHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl">Official <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">XK Trading</span> Merch</motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-3 text-sm sm:text-base text-gray-300">Wear your confidence. Trade in style.</motion.p>
      </div>
    </section>
  );
}

export default MerchHero;


