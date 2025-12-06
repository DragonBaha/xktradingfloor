import React from "react";
import { motion } from "framer-motion";

export default function CardLoader({ count = 3, horizontal = false }) {
  if (horizontal) {
    // Horizontal/rectangular card loader for Reviews page
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="card overflow-hidden"
          >
            <div className="card-body">
              <div className="flex items-start gap-4">
                {/* Logo skeleton - square */}
                <div className="h-16 w-16 rounded-lg bg-gray-800/50 relative overflow-hidden flex-shrink-0">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {/* Title and category skeleton */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-800/50 rounded w-3/4 mb-2 relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 0.2,
                          }}
                        />
                      </div>
                      <div className="h-4 bg-gray-800/50 rounded w-1/4 relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 0.4,
                          }}
                        />
                      </div>
                    </div>
                    {/* Rating skeleton */}
                    <div className="h-4 bg-gray-800/50 rounded w-16 relative overflow-hidden flex-shrink-0">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 0.6,
                        }}
                      />
                    </div>
                  </div>
                  {/* Description skeleton */}
                  <div className="space-y-2 mb-3">
                    <div className="h-3 bg-gray-800/50 rounded w-full relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 0.8,
                        }}
                      />
                    </div>
                    <div className="h-3 bg-gray-800/50 rounded w-5/6 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 1.0,
                        }}
                      />
                    </div>
                  </div>
                  {/* Links skeleton */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="h-4 bg-gray-800/50 rounded w-24 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 1.2,
                        }}
                      />
                    </div>
                    <div className="h-4 bg-gray-800/50 rounded w-20 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 1.4,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Original vertical/square card loader
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="card overflow-hidden"
        >
          {/* Image skeleton */}
          <div className="h-40 w-full bg-gray-800/50 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
          <div className="card-body">
            {/* Title skeleton */}
            <div className="h-4 bg-gray-800/50 rounded w-3/4 mb-3 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.2,
                }}
              />
            </div>
            {/* Description skeleton */}
            <div className="space-y-2 mb-3">
              <div className="h-3 bg-gray-800/50 rounded w-full relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.4,
                  }}
                />
              </div>
              <div className="h-3 bg-gray-800/50 rounded w-5/6 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.6,
                  }}
                />
              </div>
            </div>
            {/* Button skeleton */}
            <div className="h-9 bg-gray-800/50 rounded-full w-24 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.8,
                }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

