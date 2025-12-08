import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import ImageWithFallback from "../shared/ImageWithFallback.jsx";

// YouTube video IDs
const youtubeVideoIds = [
  "3Autqvt8yFE",
  "TCK6PqGEflQ",
  "v8kzN1NiFZ4",
  "WqF2QmmhbHY",
  "nC6dNjSCip8",
  "am0lGroRgqk",
  "k6GircIqITo",
];

// Function to extract video ID from YouTube URL
function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return match ? match[1] : null;
}

// Function to format duration from seconds
function formatDuration(seconds) {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Function to fetch YouTube video data using oEmbed API
// Note: oEmbed provides title but not duration. Duration requires YouTube Data API v3
async function fetchYouTubeVideoData(videoId) {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      videoUrl
    )}&format=json`;

    const response = await fetch(oEmbedUrl);
    if (!response.ok) throw new Error("Failed to fetch video data");

    const data = await response.json();

    // Try to get duration from backend API if available
    // This requires a backend endpoint that uses YouTube Data API v3
    let duration = "";
    try {
      // Check if backend has an endpoint for video duration
      const backendUrl = import.meta.env.VITE_API_URL || "";
      if (backendUrl) {
        const durationResponse = await fetch(
          `${backendUrl}/api/youtube/duration/${videoId}`
        );
        if (durationResponse.ok) {
          const durationData = await durationResponse.json();
          duration = formatDuration(durationData.duration);
        }
      }
    } catch (e) {
      // Backend endpoint not available - duration will be empty
      // To enable duration, set up a backend endpoint using YouTube Data API v3
    }

    return {
      title: data.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      url: videoUrl,
      id: videoId,
      duration: duration,
    };
  } catch (error) {
    console.error(`Error fetching video data for ${videoId}:`, error);
    return {
      title: `Video ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      id: videoId,
      duration: "",
    };
  }
}

function PodcastCard({ video }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="min-w-[320px] w-[320px] flex-shrink-0 card overflow-hidden"
    >
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block h-48 w-full bg-muted group"
      >
        <ImageWithFallback
          src={video.thumbnail}
          fallback="/assets/placeholder.jpg"
          alt={video.title}
          className="h-full w-full object-cover"
          useCdn={false}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
          </div>
        </div>
      </a>
      <div className="card-body">
        {video.duration && (
          <div className="text-xs text-gray-400 mb-2 font-medium">
            {video.duration}
          </div>
        )}
        <div
          className="font-semibold text-sm leading-relaxed break-words whitespace-normal"
          style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
        >
          {video.title}
        </div>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary rounded-full mt-3 inline-flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Watch
        </a>
      </div>
    </motion.div>
  );
}

function PodcastSection() {
  const [videos, setVideos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadVideos() {
      setLoading(true);
      try {
        const videoPromises = youtubeVideoIds.map((id) =>
          fetchYouTubeVideoData(id)
        );
        const videoData = await Promise.all(videoPromises);
        setVideos(videoData);
      } catch (error) {
        console.error("Error loading videos:", error);
        // Fallback to basic data
        setVideos(
          youtubeVideoIds.map((id) => ({
            id,
            title: `Video ${id}`,
            thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
            url: `https://www.youtube.com/watch?v=${id}`,
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            XK Talks — Trading Insights on the Go
          </h2>
          <a
            href="https://www.youtube.com/playlist?list=PL65E6nsCOWKOyb-GP45eW5Nr9cvXWA69s"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-accent hover:underline"
          >
            Watch on YouTube
          </a>
        </div>
        {loading ? (
          <div
            className="flex gap-4 overflow-x-scroll pb-2 scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {youtubeVideoIds.map((id) => (
              <div
                key={id}
                className="min-w-[320px] w-[320px] flex-shrink-0 card overflow-hidden animate-pulse"
              >
                <div className="h-48 w-full bg-gray-800"></div>
                <div className="card-body">
                  <div className="h-3 bg-gray-800 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex gap-4 overflow-x-scroll pb-2 scrollbar-hide"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {videos.map((video) => (
              <PodcastCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PodcastSection;
