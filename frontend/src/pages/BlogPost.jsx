import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogById, fetchPublishedBlogs } from '../redux/slices/blogsSlice.js';
import { fetchMockMode } from '../redux/slices/mockSlice.js';
import { getAllBlogs, getBlogById } from '../controllers/blogsController.js';
import BlogAuthorInfo from '../components/blog/BlogAuthorInfo.jsx';
import ImageWithFallback from '../components/shared/ImageWithFallback.jsx';

function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentBlog, blogs: publishedBlogs, loading } = useSelector((state) => state.blogs);
  const mockMode = useSelector((state) => state.mock.enabled);
  const [post, setPost] = React.useState(null);
  const [all, setAll] = React.useState([]);

  React.useEffect(() => {
    dispatch(fetchMockMode());
  }, [dispatch]);

  React.useEffect(() => {
    const loadBlog = async () => {
      if (mockMode) {
        // Load from mock data
        const mockBlog = await getBlogById(id);
        if (mockBlog) {
          setPost(mockBlog);
        }
        const mockBlogs = await getAllBlogs();
        setAll(mockBlogs);
      } else {
        // Load from backend
        dispatch(fetchBlogById(id));
        dispatch(fetchPublishedBlogs({ limit: 1000 }));
      }
    };
    loadBlog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, id, mockMode]);

  // Transform currentBlog to post format (only when not using mock mode)
  React.useEffect(() => {
    if (!mockMode && currentBlog) {
      const publishedDate = currentBlog.publishedAt || currentBlog.createdAt;
      const dateObj = publishedDate ? new Date(publishedDate) : new Date();
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      
      const wordCount = currentBlog.content ? currentBlog.content.replace(/<[^>]*>/g, "").split(/\s+/).length : 0;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      setPost({
        id: currentBlog._id || currentBlog.id,
        title: currentBlog.title,
        excerpt: currentBlog.excerpt,
        content: currentBlog.content,
        category: Array.isArray(currentBlog.categories) ? currentBlog.categories[0] : currentBlog.categories || currentBlog.category || "",
        tags: currentBlog.tags || [],
        author: currentBlog.author?.fullName || currentBlog.author?.name || currentBlog.author?.email || "Unknown",
        authorInfo: currentBlog.author,
        image: currentBlog.featuredImage,
        date: formattedDate,
        readTime: `${readTime} min read`,
      });
    }
  }, [currentBlog, mockMode]);

  // Transform published blogs for related posts (only when not using mock mode)
  React.useEffect(() => {
    if (!mockMode && publishedBlogs && Array.isArray(publishedBlogs)) {
      const transformed = publishedBlogs.map((blog) => {
        const publishedDate = blog.publishedAt || blog.createdAt;
        const dateObj = publishedDate ? new Date(publishedDate) : new Date();
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return {
          id: blog._id || blog.id,
          title: blog.title,
          excerpt: blog.excerpt,
          category: Array.isArray(blog.categories) ? blog.categories[0] : blog.categories || blog.category || "",
          tags: blog.tags || [],
          date: formattedDate,
        };
      });
      setAll(transformed);
    }
  }, [publishedBlogs, mockMode]);

  if (!mockMode && loading && !post) {
    return <div className="max-w-3xl mx-auto px-4 py-10">Loading...</div>;
  }

  if (!post) {
    return <div className="max-w-3xl mx-auto px-4 py-10">Post not found.</div>;
  }

  const related = all.filter(p => p.id !== post.id && (p.category === post.category || p.tags?.some(t => post.tags?.includes(t)))).slice(0,3);

  return (
    <div>
      <Helmet>
        <title>{post ? `${post.title} | XK Trading Floor` : 'Blog Post | XK Trading Floor'}</title>
        <meta name="description" content={post?.excerpt || 'Read our latest trading insights and market analysis.'} />
      </Helmet>
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="bg-gray-900/50 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-64 w-full rounded-xl overflow-hidden bg-muted mb-6">
            {post.image && (
              <ImageWithFallback 
                src={post.image} 
                fallback="/assets/placeholder.jpg" 
                alt={post.title} 
                className="h-full w-full object-cover"
                useDynamicFallback={true}
              />
            )}
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight">{post.title}</h1>
          <div className="text-xs sm:text-sm text-gray-400 mt-1">{post.author} • {post.date} • {post.readTime}</div>
        </div>
      </motion.section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        <BlogAuthorInfo author={post.authorInfo} />

        <div className="mt-10">
          <h3 className="font-display font-bold text-lg sm:text-xl mb-4">Related Posts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(r => (
              <div key={r.id} className="card cursor-pointer" onClick={() => navigate(`/blog/${r.id}`)}>
                <div className="card-body">
                  <div className="text-xs text-blue-300">{r.category}</div>
                  <div className="font-semibold text-sm sm:text-base mt-1 line-clamp-2">{r.title}</div>
                </div>
              </div>
            ))}
            {related.length === 0 && <div className="text-sm text-gray-400">No related posts found.</div>}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-display font-bold text-lg sm:text-xl mb-2">Comments</h3>
          <div className="text-xs sm:text-sm text-gray-400">Comments will be available after backend integration.</div>
        </div>

        <div className="mt-8"><Link to="/blog" className="text-accent hover:underline">← Back to Blog</Link></div>
      </section>
    </div>
  );
}

export default BlogPost;


