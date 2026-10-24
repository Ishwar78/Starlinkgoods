
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiArrowRight,
  FiPlay,
  FiRefreshCw,
} from "react-icons/fi";
import "./InformationalVideos.css";
import Footer from "../components/Footer";
const categories = [
  { name: "Judgments", path: "/resources/judgments" },
  {
    name: "Informational Videos",
    path: "/resources/informational-videos",
  },
  { name: "In The News", path: "/in-news" },
  { name: "Research", path: "/resources/research" },
];

const videos = [
  {
    id: 1,
    title:
      "Digambar Gaikwad – Man who won a False Molestation case and got 10Lac compensation",
    image: "/images/video-digambar-gaikwad.jpg",
    url: "https://www.youtube.com/",
  },
  {
    id: 2,
    title:
      "Interview with Advocate Sahil Mongia | Bail to Man accused of Raping woman who had tattooed his name",
    image: "/images/video-sahil-mongia.jpg",
    url: "https://www.youtube.com/",
  },
  {
    id: 3,
    title:
      "He spent 8 months in Jail in a False Rape Case & WON after 6 Years | Story of Arnab Ganguly",
    image: "/images/video-arnab-ganguly.jpg",
    url: "https://www.youtube.com/",
  },
  {
    id: 4,
    title:
      "MEET MEHUL – MAN WHO FOUGHT FALSE 498A, PROVED ADULTERY BY WIFE & WON DIVORCE",
    image: "/images/video-mehul.jpg",
    url: "https://www.youtube.com/",
  },
  {
    id: 5,
    title:
      "How to use ChatGPT to fight false cases | Yuvraj | Men Welfare Trust | Deepika Narayan Bhardwaj",
    image: "/images/video-chatgpt-false-cases.jpg",
    url: "https://www.youtube.com/",
  },
  {
    id: 6,
    title:
      "COURT ORDERS CRIMINAL CASES AGAINST WIFE IN PERJURY CASE | MEET THE HUSBAND MAHESH R V",
    image: "/images/video-mahesh-rv.jpg",
    url: "https://www.youtube.com/",
  },
];

export default function InformationalVideos() {
  const [visibleCount, setVisibleCount] = useState(6);

  const visibleVideos = videos.slice(0, visibleCount);

  return (
    <>
    <main className="info-videos-page">
      {/* Hero Banner */}
      <section className="iv-hero">
        <div className="iv-hero-overlay" />
        <div className="iv-hero-title">
          <h1>Informational Videos</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="iv-content">
        <div className="iv-container">
          {/* Resource Navigation */}
          <nav
            className="iv-category-nav"
            aria-label="Resource categories"
          >
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className={`iv-category-link ${
                  category.name === "Informational Videos"
                    ? "active"
                    : ""
                }`}
                aria-current={
                  category.name === "Informational Videos"
                    ? "page"
                    : undefined
                }
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Video Gallery */}
          <div className="iv-video-grid">
            {visibleVideos.map((video) => (
              <article className="iv-video-card" key={video.id}>
                <a
                  className="iv-video-image-link"
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Watch ${video.title}`}
                >
                  <img
                    src={video.image}
                    alt={video.title}
                    className="iv-video-image"
                    loading={video.id > 3 ? "lazy" : "eager"}
                  />

                  <span className="iv-play-button">
                    <FiPlay />
                  </span>
                </a>

                <h2 className="iv-video-title">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {video.title}
                  </a>
                </h2>
              </article>
            ))}
          </div>

          {/* Load More */}
          {visibleCount < videos.length && (
            <div className="iv-load-more-wrap">
              <button
                type="button"
                className="iv-load-more"
                onClick={() =>
                  setVisibleCount((count) =>
                    Math.min(count + 6, videos.length)
                  )
                }
              >
                LOAD MORE <FiRefreshCw />
              </button>
            </div>
          )}
        </div>

        {/* Donation Banner */}
        <section className="iv-donation-banner">
          <div className="iv-donation-content">
            <h2>
              Interested in contributing towards
              <br />
              Men Rights?
            </h2>

            <p>
              Support our mission to advocate for gender-neutral laws
              and raise awareness about issues faced by men with your
              donation today.
            </p>

            <Link to="/contact" className="iv-donation-button">
              <FiHeart />
              Yes! I Want to help
              <FiArrowRight className="iv-donation-arrow" />
            </Link>
          </div>

          <div className="iv-donation-image" aria-hidden="true" />
        </section>
      </section>
    </main>
    <Footer />
    </>
  );
}
