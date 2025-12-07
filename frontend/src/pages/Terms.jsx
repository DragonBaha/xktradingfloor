import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FileText, AlertTriangle, Shield, User, Ban, Copyright, Download, Users, XCircle, RefreshCw, Mail, Globe, ExternalLink } from "lucide-react";

function Terms() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = [
    {
      id: 1,
      title: "General Disclaimer",
      icon: AlertTriangle,
      highlight: "We do NOT provide financial advice. Trading Forex, Crypto, Stocks, and CFDs involves risk. You may lose all invested capital.",
      items: [
        "Educational content",
        "Market analysis",
        "Podcasts",
        "Reviews of brokers, prop firms, and trading tools",
        "Digital downloads",
      ],
      note: "You are responsible for your own trading decisions.",
    },
    {
      id: 2,
      title: "No Investment Advice",
      icon: Ban,
      items: [
        "Financial advice",
        "Trading signals",
        "Personalized recommendations",
        "Professional guidance",
      ],
      note: "Content is educational only.",
    },
    {
      id: 3,
      title: "Affiliate Disclosure",
      icon: Shield,
      items: [
        "Brokers",
        "Prop firms",
        "Trading tools",
        "Digital products",
      ],
      note: "This does not influence our reviews or opinions.",
      liability: [
        "Your decisions",
        "Your losses",
        "Issues resulting from a third-party provider",
      ],
    },
    {
      id: 4,
      title: "User Accounts",
      icon: User,
      items: [
        "Provide accurate information",
        "Keep credentials private",
        "Do not impersonate anyone",
      ],
      note: "We may suspend accounts that violate our rules.",
    },
    {
      id: 5,
      title: "Acceptable Use",
      icon: Ban,
      items: [
        "Use our content for illegal activity",
        "Copy, resell, or distribute our materials",
        "Attempt to hack or exploit the website",
        "Spam or harass other users",
        "Spread false information",
      ],
      note: "You agree NOT to:",
    },
    {
      id: 6,
      title: "Content Ownership",
      icon: Copyright,
      items: [
        "Owned by us",
        "Protected by copyright",
      ],
      note: "You may not reuse, reproduce, or republish without permission.",
    },
    {
      id: 7,
      title: "Digital Products & Downloads",
      icon: Download,
      items: [
        "For personal use only",
        "Not to be resold or redistributed",
      ],
      note: "We reserve the right to update or modify products at any time.",
    },
    {
      id: 8,
      title: "Community Rules",
      icon: Users,
      items: [
        "Be respectful",
        "No abusive language",
        "No self-promotion unless allowed",
        "No trading signals unless approved",
      ],
      note: "Violation may lead to removal.",
    },
    {
      id: 9,
      title: "Limitation of Liability",
      icon: Shield,
      highlight: "Use the site at your own risk.",
      items: [
        "Trading losses",
        "Account issues with brokers/prop firms",
        "Errors, omissions, or updates",
        "Downtime or technical faults",
      ],
    },
    {
      id: 10,
      title: "Termination",
      icon: XCircle,
      items: [
        "You violate Terms",
        "Engage in abusive behavior",
        "Attempt to exploit our platform",
      ],
    },
    {
      id: 11,
      title: "Changes to Terms",
      icon: RefreshCw,
      content: "We may update Terms at any time. Continued use = acceptance of updated Terms.",
    },
  ];

  return (
    <div className="bg-black min-h-screen">
      <Helmet>
        <title>Terms & Conditions | XK Trading Floor</title>
        <meta
          name="description"
          content="Terms & Conditions for XK Trading Floor. Read our terms of service and usage policies."
        />
        <link rel="canonical" href="/terms" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-6">
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">Terms</span> & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mb-2">Last Updated: {currentDate}</p>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mt-6">
              These Terms & Conditions ("Terms") govern your use of XK Trading Floor and all content, tools, and services provided through{" "}
              <a
                href="https://xktradingfloor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
              >
                https://xktradingfloor.com
                <ExternalLink className="h-3 w-3" />
              </a>
              . By accessing or using our platform, you agree to comply with these Terms.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 sm:p-8 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display font-bold text-lg sm:text-xl lg:text-2xl text-white mb-3">
                      {section.id}. {section.title}
                    </h2>
                    {section.highlight && (
                      <p className="text-yellow-400 font-semibold mb-3 text-sm sm:text-base">
                        {section.highlight}
                      </p>
                    )}
                    {section.content ? (
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        {section.content}
                      </p>
                    ) : (
                      <>
                        {section.note && section.id === 5 && (
                          <p className="text-gray-300 font-medium mb-2 text-sm sm:text-base">
                            {section.note}
                          </p>
                        )}
                        {section.items && (
                          <ul className={`list-disc list-inside space-y-2 ml-2 text-gray-300 text-sm sm:text-base ${section.id === 5 ? '' : ''}`}>
                            {section.items.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                            ))}
                          </ul>
                        )}
                        {section.liability && (
                          <div className="mt-4">
                            <p className="text-gray-300 font-medium mb-2 text-sm sm:text-base">
                              You agree we are not liable for:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-300 text-sm sm:text-base">
                              {section.liability.map((item, itemIndex) => (
                                <li key={itemIndex}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {section.note && section.id !== 5 && (
                          <p className="text-gray-400 text-sm mt-4 italic">{section.note}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6 sm:p-8 mt-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-lg sm:text-xl lg:text-2xl text-white mb-3">
                12. Contact Information
              </h2>
              <p className="text-gray-300 text-sm sm:text-base mb-4">
                For questions or concerns:
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:x.tradersz@gmail.com"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base"
                >
                  <Mail className="h-4 w-4" />
                  x.tradersz@gmail.com
                </a>
                <a
                  href="https://xktradingfloor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base"
                >
                  <Globe className="h-4 w-4" />
                  https://xktradingfloor.com
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Terms;
