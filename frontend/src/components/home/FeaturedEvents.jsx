import React from 'react';
import { motion } from 'framer-motion';
import { getAllEvents } from '../../controllers/eventsController.js';
import { Link, useNavigate } from 'react-router-dom';
import ImageWithFallback from '../shared/ImageWithFallback.jsx';

function EventCard({ evt, onClick }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div whileHover={{ y: -4 }} className="card overflow-hidden cursor-pointer" onClick={onClick}>
      <div className="h-40 w-full bg-muted">
        <ImageWithFallback src={evt.image || '/assets/placeholder.jpg'} fallback="/assets/placeholder.jpg" alt={evt.title} className="h-full w-full object-cover" />
      </div>
      <div className="card-body">
        <div className="text-sm text-gray-400 mb-2">{formatDate(evt.dateTime || evt.date)}</div>
        <div className="font-display font-extrabold text-xl sm:text-2xl tracking-tight mb-2">{evt.title}</div>
        <div className="text-lg text-gray-300 font-medium line-clamp-2">{evt.excerpt || evt.description || ''}</div>
      </div>
    </motion.div>
  );
}

function FeaturedEvents() {
  const [events, setEvents] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => setEvents(await getAllEvents()))();
  }, []);

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
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
            Upcoming <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">Events & Webinars</span>
          </motion.h2>
        </motion.div>
        <div className="flex items-center justify-between mb-4">
          <Link to="/academy" className="text-sm text-blue-400 hover:text-blue-300 hover:underline ml-auto">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.slice(0,4).map((evt) => (
            <EventCard 
              key={evt.id} 
              evt={evt} 
              onClick={() => navigate(`/events/${evt.id}`, { state: { event: evt } })} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedEvents;


