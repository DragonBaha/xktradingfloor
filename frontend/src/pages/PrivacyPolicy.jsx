import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Users,
  Globe,
  Mail,
  ExternalLink,
} from "lucide-react";

function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = [
    {
      id: 1,
      title: "Information We Collect",
      icon: FileText,
      subsections: [
        {
          title: "A. Information You Provide",
          items: [
            "Name",
            "Email address",
            "Account login details",
            "Information submitted through forms (reviews, contact forms, surveys)",
            "Payment details (processed securely by third-party providers — we do not store card data)",
            "Trade journals or notes you upload voluntarily (if applicable)",
          ],
        },
        {
          title: "B. Automatically Collected Information",
          items: [
            "IP address",
            "Browser type and version",
            "Device information",
            "Cookies and tracking technologies",
            "Pages viewed and time spent on the website",
            "Referral sources (e.g., Google, YouTube, Instagram)",
          ],
        },
        {
          title: "C. Third-Party Data",
          items: [
            "Google Analytics",
            "YouTube",
            "Affiliate partners (brokers, prop firms)",
            "Payment processors (Whop, Stripe, PayPal, Crypto processors)",
          ],
        },
      ],
    },
    {
      id: 2,
      title: "How We Use Your Information",
      icon: Eye,
      items: [
        "Provide and maintain the Service",
        "Improve user experience and website functionality",
        "Respond to inquiries and support requests",
        "Send updates, newsletters, and marketing communication (optional)",
        "Track performance of affiliate links",
        "Prevent fraud or misuse of the Service",
        "Comply with legal obligations",
      ],
    },
    {
      id: 3,
      title: "Cookies & Tracking Technologies",
      icon: Lock,
      items: [
        "Website functionality",
        "Analytics",
        "Personalization",
        "Affiliate tracking",
        "Remembering login sessions",
      ],
      note: "You may disable cookies in your browser settings, but some features may not work properly.",
    },
    {
      id: 4,
      title: "Sharing of Information",
      icon: Users,
      highlight: "We do not sell your personal information.",
      items: [
        "Service Providers (hosting, analytics, email delivery)",
        "Payment Processors",
        "Affiliate Partners (for tracking conversions — no personal data is shared unless necessary)",
        "Legal Authorities (if required by law)",
      ],
      note: "All sharing is secure and purpose-based.",
    },
    {
      id: 5,
      title: "Data Security",
      icon: Shield,
      content:
        "We use industry-standard security measures to protect your data. However, no system is 100% secure; use our services at your own risk.",
    },
    {
      id: 6,
      title: "Data Retention",
      icon: Lock,
      items: [
        "Necessary to provide services",
        "Required by law",
        "You maintain an account with us",
      ],
      note: "You may request deletion at any time.",
    },
    {
      id: 7,
      title: "Your Rights",
      icon: Users,
      content:
        "Depending on your location (e.g., EU/UK GDPR), you may request:",
      items: [
        "Access to your data",
        "Correction of your data",
        "Deletion of your data",
        "Opt-out of marketing communication",
        "Restriction of processing",
      ],
      note: "Email us at: x.tradersz@gmail.com",
    },
    {
      id: 8,
      title: "Third-Party Links",
      icon: Globe,
      content:
        "Our site contains links to brokers, prop firms, and educational tools. We are not responsible for their privacy practices.",
    },
    {
      id: 9,
      title: "Children's Privacy",
      icon: Shield,
      content:
        "Our service is not intended for users under 18. If we learn we have collected information from a minor, we will delete it.",
    },
  ];

  return (
    <div className="bg-black min-h-screen">
      <Helmet>
        <title>Privacy Policy | XK Trading Floor</title>
        <meta
          name="description"
          content="Privacy Policy for XK Trading Floor. Learn how we collect, use, and protect your personal information."
        />
        <link rel="canonical" href="/privacy-policy" />
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
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">
                Privacy
              </span>{" "}
              Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mb-2">
              Last Updated: {currentDate}
            </p>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mt-6">
              XK Trading Floor ("we", "our", "us") operates the website{" "}
              <a
                href="https://xktradingfloor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
              >
                https://xktradingfloor.com
                <ExternalLink className="h-3 w-3" />
              </a>{" "}
              and related services. We respect your privacy and are committed to
              protecting your personal data.
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
                      <p className="text-blue-400 font-semibold mb-3 text-sm sm:text-base">
                        {section.highlight}
                      </p>
                    )}
                    {section.content && (
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                        {section.content}
                      </p>
                    )}
                    {section.subsections ? (
                      <div className="space-y-4">
                        {section.subsections.map((subsection, subIndex) => (
                          <div key={subIndex} className="ml-2">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-200 mb-2">
                              {subsection.title}
                            </h3>
                            <ul className="list-disc list-inside space-y-1.5 ml-2 text-gray-300 text-sm">
                              {subsection.items.map((item, itemIndex) => (
                                <li key={itemIndex}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : section.items ? (
                      <ul className="list-disc list-inside space-y-2 ml-2 text-gray-300 text-sm sm:text-base">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    {section.note && (
                      <p className="text-gray-400 text-sm mt-4 italic">
                        {section.note}
                      </p>
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
                10. Contact Us
              </h2>
              <p className="text-gray-300 text-sm sm:text-base mb-4">
                If you have questions about this policy:
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

export default PrivacyPolicy;
