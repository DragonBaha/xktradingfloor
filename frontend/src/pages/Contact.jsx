import React from "react";
import HeroSection from "../components/shared/HeroSection.jsx";
import SectionHeader from "../components/shared/SectionHeader.jsx";
import AnimatedDivider from "../components/shared/AnimatedDivider.jsx";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

function Contact() {
  const [ok, setOk] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    type: "General Inquiry",
    message: "",
  });
  function submit(e) {
    e.preventDefault();
    setOk(true);
    setTimeout(() => setOk(false), 1500);
  }

  return (
    <div className="bg-black min-h-screen">
      <Helmet>
        <title>Contact | XK Trading Floor</title>
        <meta
          name="description"
          content="Get in touch with XK Trading Floor for support, partnerships, or feedback."
        />
        <link rel="canonical" href="/contact" />
        <meta property="og:title" content="Contact | XK Trading Floor" />
        <meta property="og:description" content="We'd love to hear from you." />
      </Helmet>

      <HeroSection
        title={<>Get in <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">Touch</span></>}
        subtitle="Questions, feedback, or collaboration ideas? We're here to help."
        buttonText="Contact Form"
        scrollTo="#contact-form"
      />

      <section
        id="contact-form"
        className="py-20 bg-black relative overflow-hidden"
      >
        {/* Background decoration */}
        {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-4">
                  Send a <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">Message</span>
                </h2>
                <p className="text-sm sm:text-base text-gray-300 mb-8">
                  We usually respond within 1–2 business days
                </p>
              </motion.div>

              <form
                onSubmit={submit}
                className="card bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-6 lg:p-8"
              >
                <div className="space-y-5">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-300">
                      Your Name
                    </span>
                    <input
                      required
                      className="input bg-gray-800/50 border-gray-700 focus:border-blue-500"
                      aria-label="Your Name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-300">
                      Email
                    </span>
                    <input
                      required
                      className="input bg-gray-800/50 border-gray-700 focus:border-blue-500"
                      type="email"
                      aria-label="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-300">
                      Inquiry Type
                    </span>
                    <select
                      className="input bg-gray-800/50 border-gray-700 focus:border-blue-500"
                      aria-label="Inquiry Type"
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                    >
                      <option>General Inquiry</option>
                      <option>Podcast Guest Request</option>
                      <option>YouTube Sponsorship</option>
                      <option>Partnership Opportunity</option>
                      <option>Technical Support</option>
                      <option>Media/Press Inquiry</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-300">
                      Message
                    </span>
                    <textarea
                      required
                      className="input bg-gray-800/50 border-gray-700 focus:border-blue-500 h-32 resize-none"
                      aria-label="Message"
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn w-full rounded-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-500 hover:border-blue-600 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 px-6 py-3 font-medium"
                    aria-label="Send message"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight mb-6">
                  <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">Contact</span> Details
                </h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm sm:text-base text-gray-300">
                    <Mail
                      className="text-blue-400 h-5 w-5"
                      aria-hidden="true"
                    />
                    <a
                      href="mailto:x.tradersz@gmail.com"
                      className="hover:text-white transition-colors"
                    >
                      x.tradersz@gmail.com
                    </a>
                  </li>
                  <li className="flex items-center gap-3 text-sm sm:text-base text-gray-300">
                    <MessageSquare
                      className="text-blue-400 h-5 w-5"
                      aria-hidden="true"
                    />
                    <span>Live chat (coming soon)</span>
                  </li>
                </ul>
              </motion.div>

              <AnimatedDivider />

              {/* Social Media Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h3 className="font-display font-bold text-lg sm:text-xl tracking-tight mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">Follow</span> Us
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://www.youtube.com/@xk_trading_floor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-blue-500 hover:bg-gray-800 transition-all group"
                    aria-label="YouTube"
                  >
                    <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                      <Youtube className="h-5 w-5 text-red-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                      YouTube
                    </span>
                  </a>
                  <a
                    href="https://www.instagram.com/xktradingfloor/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-blue-500 hover:bg-gray-800 transition-all group"
                    aria-label="Instagram"
                  >
                    <div className="h-10 w-10 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
                      <Instagram className="h-5 w-5 text-pink-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                      Instagram
                    </span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/xk-trading-floor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-blue-500 hover:bg-gray-800 transition-all group"
                    aria-label="LinkedIn"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <Linkedin className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                      LinkedIn
                    </span>
                  </a>
                  <a
                    href="https://x.com/XK_Capital"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-blue-500 hover:bg-gray-800 transition-all group"
                    aria-label="X (Twitter)"
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-500/20 flex items-center justify-center group-hover:bg-gray-500/30 transition-colors">
                      <Twitter className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                      X
                    </span>
                  </a>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
      </section>

      {ok && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-6 right-6 bg-gray-900/90 border border-blue-500/50 rounded-lg px-6 py-4 shadow-lg shadow-blue-500/20 z-50"
        >
          <div className="text-sm font-medium text-white">
            Thanks! Your message has been sent.
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Contact;
