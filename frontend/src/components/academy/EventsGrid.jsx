import React from "react";
import { motion } from "framer-motion";
import { getAllEvents } from "../../controllers/eventsController.js";
import { Calendar, User } from "lucide-react";
import ImageWithFallback from "../shared/ImageWithFallback.jsx";

function EventCard({ evt, onRegister }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="card overflow-hidden">
      <div className="h-40 w-full bg-muted">
        <ImageWithFallback
          src={evt.image}
          fallback="/assets/placeholder.jpg"
          alt={evt.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="card-body">
        <div className="text-sm text-gray-400 flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {evt.date}
          </span>
          {evt.instructor && (
            <span className="inline-flex items-center gap-1">
              <User className="h-4 w-4" /> {evt.instructor}
            </span>
          )}
        </div>
        <div className="font-semibold mt-1">{evt.title}</div>
        <div className="text-sm text-gray-400 mt-1 line-clamp-2">
          {evt.description}
        </div>
        <button
          className="btn btn-primary rounded-full mt-3 opacity-100 visible"
          style={{ visibility: 'visible', opacity: 1 }}
          onClick={() => onRegister(evt)}
        >
          Register
        </button>
      </div>
    </motion.div>
  );
}

function EventsGrid({ onOpenRegister }) {
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    (async () => setEvents(await getAllEvents()))();
  }, []);

  return (
    <section id="academy-events" className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-xl font-semibold mb-4">
          Events
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((evt) => (
            <EventCard key={evt.id} evt={evt} onRegister={onOpenRegister} />
          ))}
        </div>
        <div className="text-center mt-6">
          <button className="btn btn-secondary rounded-full opacity-100 visible" style={{ visibility: 'visible', opacity: 1 }}>
            View Past Events
          </button>
        </div>
      </div>
    </section>
  );
}

export default EventsGrid;
