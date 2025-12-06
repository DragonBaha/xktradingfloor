import React from 'react';
import { motion } from 'framer-motion';
import { getAllFreebies } from '../../controllers/freebiesController.js';
import { FileText, Video, Download } from 'lucide-react';

const typeIcon = (type) => {
  switch (type) {
    case 'ebook':
    case 'guide':
    case 'sheet':
      return <FileText className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    default:
      return <Download className="h-5 w-5" />;
  }
};

function FreeResources() {
  const [items, setItems] = React.useState([]);
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => {
    (async () => setItems(await getAllFreebies()))();
  }, []);

  const filtered = items.filter(i => (filter === 'all' ? true : i.type === filter));

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold">Free Learning Resources</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'ebook', 'guide', 'video', 'sheet'].map(t => (
              <button 
                key={t} 
                className={`btn rounded-full whitespace-nowrap ${filter===t? 'btn-primary':'btn-secondary'} opacity-100 visible`} 
                onClick={() => setFilter(t)}
                style={{ visibility: 'visible', opacity: 1 }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(f => (
            <motion.a
              whileHover={{ y: -4 }}
              key={f.id}
              href={f.link}
              target={f.link?.startsWith('http') ? '_blank' : undefined}
              rel={f.link?.startsWith('http') ? 'noreferrer' : undefined}
              className="card block"
            >
              <div className="card-body">
                <div className="h-10 w-10 rounded bg-accent/10 text-accent flex items-center justify-center mb-3">
                  {typeIcon(f.type)}
                </div>
                <div className="font-semibold">{f.title}</div>
                <div className="text-sm text-gray-400 mt-1 line-clamp-2">{f.description}</div>
                <div className="inline-flex items-center gap-2 text-accent text-sm mt-3">Download/Watch <Download className="h-4 w-4" /></div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FreeResources;


