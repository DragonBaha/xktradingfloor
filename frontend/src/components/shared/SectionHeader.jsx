import React from 'react';

export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{title}</h2>
      {subtitle && <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-2xl">{subtitle}</p>}
    </div>
  );
}


