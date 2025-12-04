import React from 'react';
import { motion } from 'framer-motion';
import { getAllBlogs } from '../../controllers/blogsController.js';
import { Link, useNavigate } from 'react-router-dom';
import ImageWithFallback from '../shared/ImageWithFallback.jsx';

function BlogCard({ post, onClick }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="card overflow-hidden cursor-pointer" onClick={onClick}>
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
        <div className="text-xs text-gray-400">{post.author} • {post.date}</div>
        <div className="font-semibold mt-1">{post.title}</div>
        <div className="text-sm text-gray-400 mt-1 line-clamp-2">{post.excerpt}</div>
      </div>
    </motion.div>
  );
}

function LatestBlogs() {
  const [blogs, setBlogs] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => setBlogs(await getAllBlogs()))();
  }, []);

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Insights & Market Analysis</h2>
          <Link to="/blog" className="text-sm text-accent hover:underline">View More Articles</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.slice(0,3).map((post) => (
            <BlogCard key={post.id} post={post} onClick={() => navigate(`/blog/${post.id}`)} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default LatestBlogs;


