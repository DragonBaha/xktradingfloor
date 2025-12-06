import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import ImageWithFallback from '../shared/ImageWithFallback.jsx';

function PodcastSection() {
  const videos = [
    {
      id: 1,
      title: "Beginner Traders Listen Up! Raja Banks' Advice & Best Broker Tips",
      thumbnail: "https://img.youtube.com/vi/am0lGroRgqk/maxresdefault.jpg",
      url: "https://youtu.be/am0lGroRgqk?si=hMVCF6AF-o273QoT"
    },
    {
      id: 2,
      title: "SoloETV Journey: From Losing $100K to Making Millions & Passing Prop Firms",
      thumbnail: "https://img.youtube.com/vi/nC6dNjSCip8/maxresdefault.jpg",
      url: "https://youtu.be/nC6dNjSCip8?si=N7oq_hIilyG7wUWP"
    },
    {
      id: 3,
      title: "Alchemist AI: Reviewing the Forex Algorithm that Delivers 8-10% Returns!",
      thumbnail: "https://img.youtube.com/vi/VQAvDRi-5P8/maxresdefault.jpg",
      url: "https://youtu.be/VQAvDRi-5P8?si=x7deI7VERmk3QK4F"
    },
    {
      id: 4,
      title: "From Losses to My FIRST Payout — $894 Earned Trading Forex",
      thumbnail: "https://img.youtube.com/vi/_B67GB5jPSY/maxresdefault.jpg",
      url: "https://youtu.be/_B67GB5jPSY?si=qf4dwQ9vj1xfEXHO"
    }
  ];

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
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
            Recent <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">Podcast & Video</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-300 font-medium max-w-2xl mx-auto"
          >
            Watch our latest content and learn from expert traders
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {videos.map((video, index) => (
            <motion.a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card group cursor-pointer hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 block"
            >
              <div className="relative">
                <ImageWithFallback
                  src={video.thumbnail}
                  fallback="/assets/placeholder.jpg"
                  alt={video.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>
              <div className="card-body">
                <h3 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight mb-1 line-clamp-2">{video.title}</h3>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PodcastSection;

