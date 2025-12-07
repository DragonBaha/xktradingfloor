import React from 'react';
import { motion } from 'framer-motion';

export default function InfoCard({ icon: Icon, title, children }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }} 
      className="card bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 hover:scale-[1.02] hover:border-gray-600/50 transition-all duration-300"
    >
      <div className="card-body p-6">
        <div className="flex items-center gap-3 mb-3">
          {Icon && (
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="font-bold text-base sm:text-lg text-white">{title}</div>
        </div>
        <div className="text-gray-300 text-sm sm:text-base leading-relaxed">
          {children}
        </div>
      </div>
    </motion.div>
  );
}


