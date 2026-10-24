
import React from "react";
import "./Podcast.css";
import Footer from "../components/Footer";
const podcastVideos = [
  {
    id: 1,
    title:
      "ACCUSED OF MOLESTATION FOR INVESTIGATING A MURDER, PROVED INNOCENT AFTER 8 YEARS | PRAKASH SWAMY",
    description: "",
    image: "/podcast-1.jpg",
    videoId: "REPLACE_WITH_YOUTUBE_VIDEO_ID_1",
  },
  {
    id: 2,
    title:
      "औरतों के हक की लड़ाई से पुरुषों के दर्द तक - SAVITA ARYA",
    description:
      "इस खास बातचीत में Savita Arya से बात हुई है महिलाओं के अधिकारों, पुरुषों के खिलाफ झूठे आरोपों, कानून के दुरुपयोग और उन लोगों के बारे में जो आरोपों और कानूनी लड़ाई के बीच अपनी जिंदगी खोने की कगार पर पहुंच जाते हैं।",
    image: "/podcast-2.jpg",
    videoId: "REPLACE_WITH_YOUTUBE_VIDEO_ID_2",
  },
  {
    id: 3,
    title:
      "WHY MONEY TALK IS IMPORTANT TO HAVE A SUCCESSFUL MARRIAGE Ft AMIT KUKREJA",
    description:
      "We bring you an often overlooked and often avoided topic in marriage: MONEY. Joining us is Amit Kukreja, a financial advisor with over 11 years of experience. Amit specialises in helping families navigate their finances when two strongly opinionated individuals have different approaches to money and financial decision-making.",
    image: "/podcast-3.jpg",
    videoId: "REPLACE_WITH_YOUTUBE_VIDEO_ID_3",
  },
];

function PodcastVideo({ video }) {
  const [expanded, setExpanded] = React.useState(true);

  const hasValidVideo =
    video.videoId &&
    !video.videoId.startsWith("REPLACE_WITH_");

  return (
    <article className="podcast-video-section">
      <div className="podcast-video-content">
        <div className="podcast-player">
          {hasValidVideo ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
              title={video.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <a
              className="podcast-thumbnail-link"
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                video.title
              )}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`Find podcast: ${video.title}`}
            >
              <img
                src={video.image}
                alt={video.title}
                className="podcast-thumbnail"
                loading="lazy"
              />
              <span className="podcast-play-button" aria-hidden="true">
                ▶
              </span>
              <span className="podcast-watch-label">
                Watch on YouTube
              </span>
            </a>
          )}
        </div>

        <div className="podcast-video-details">
          <h2>{video.title}</h2>

          {video.description && (
            <div
              className={`podcast-description ${
                expanded ? "description-expanded" : ""
              }`}
            >
              {video.description}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="podcast-expand-button"
        onClick={() => setExpanded((previous) => !previous)}
        aria-label={expanded ? "Collapse description" : "Expand description"}
        aria-expanded={expanded}
      >
        {expanded ? "−" : "+"}
      </button>
    </article>
  );
}

export default function Podcast() {
  return (
    <>
    <main className="podcast-page">
      {/* Hero Banner */}
      <section className="podcast-hero">
        <img
          className="podcast-hero-image"
          src="/podcast-hero.png"
          alt="The Ekam Nyaay Show"
        />
      </section>

      {/* Podcast Videos */}
      <section className="podcast-list" aria-label="Podcast episodes">
        {podcastVideos.map((video) => (
          <PodcastVideo key={video.id} video={video} />
        ))}
      </section>
    </main>
    <Footer />
    </>
  );
}
