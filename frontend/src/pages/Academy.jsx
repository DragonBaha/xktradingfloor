import React from 'react';
import { Helmet } from 'react-helmet-async';
import HeroAcademy from '../components/academy/HeroAcademy.jsx';
import EventsGrid from '../components/academy/EventsGrid.jsx';
import FreeResources from '../components/academy/FreeResources.jsx';
import PodcastSection from '../components/academy/PodcastSection.jsx';
import RegisterModal from '../components/academy/RegisterModal.jsx';

function Academy() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  function handleOpenRegister(evt) {
    setSelectedEvent(evt);
    setModalOpen(true);
  }

  return (
    <div className="bg-black min-h-screen">
      <Helmet>
        <title>Academy | XK Trading Floor</title>
        <meta name="description" content="Master the markets with expert-led programs, live workshops, strategy sessions, and trading bootcamps." />
      </Helmet>
      <HeroAcademy />
      <div className="bg-black">
        <EventsGrid onOpenRegister={handleOpenRegister} />
        <FreeResources />
        <PodcastSection />
      </div>
      <RegisterModal isOpen={modalOpen} onClose={() => setModalOpen(false)} selectedEvent={selectedEvent} />
    </div>
  );
}

export default Academy;


