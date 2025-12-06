import React from 'react';
import { Link } from 'react-router-dom';
import { getAssetPath } from '../utils/assets.js';

function Footer() {
  return (
    <footer className="mt-12 border-t border-border/60 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center mb-4">
            <img
              src={getAssetPath("/assets/navbar logo.png")}
              alt="XK Trading Floor Logo"
              className="h-16 w-auto rounded object-contain"
            />
          </Link>
          <p className="text-sm text-gray-400">Learn, trade, and grow with a modern trading community.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Links</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/academy" className="hover:text-white">Academy</Link></li>
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link to="/reviews" className="hover:text-white">Reviews</Link></li>
            {/* <li><Link to="/merch" className="hover:text-white">Merch</Link></li> */} {/* Hidden - uncomment to re-enable */}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><a href="#" className="hover:text-white">Privacy</a></li>
            <li><a href="#" className="hover:text-white">Terms</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Stay updated</h4>
          <form className="flex gap-2">
            <input className="input" placeholder="Email address" type="email" />
            <button className="btn btn-primary" type="button">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} XK Trading Floor</div>
    </footer>
  );
}

export default Footer;


