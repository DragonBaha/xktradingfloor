import React from 'react';
import { motion } from 'framer-motion';
import ImageWithFallback from '../shared/ImageWithFallback.jsx';

function BlogCard({ post, onClick }) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} className="card overflow-hidden cursor-pointer shadow-lg shadow-blue-500/10" onClick={onClick}>
      <div className="h-40 w-full bg-muted">
        <ImageWithFallback 
          src={post.image} 
          fallback="/assets/placeholder.jpg" 
          alt={post.title} 
          className="h-full w-full object-cover"
          useDynamicFallback={true}
        />
      </div>
      <div className="card-body">
        <div className="text-xs text-blue-300">{post.category}</div>
        <h3 className="font-semibold mt-1">{post.title}</h3>
        <div className="text-xs text-gray-400 mt-1">{post.author} • {post.date} • {post.readTime}</div>
        <p className="text-sm text-gray-300 mt-2 line-clamp-2">{post.excerpt}</p>
      </div>
    </motion.div>
  );
}

export default BlogCard;


