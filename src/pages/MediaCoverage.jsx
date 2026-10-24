
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiHeart,
  FiRefreshCw,
  FiExternalLink,
} from "react-icons/fi";
import "./MediaCoverage.css";
import Footer from "../components/Footer";
/*
  IMPORTANT:
  All image paths below are relative to the public folder.
  Example: public/images/news-banner.jpg -> /images/news-banner.jpg
  Replace sample filenames with your actual public-folder filenames.
*/

const mediaNews = [
  {
    id: 1,
    category: "Digital Coverage",
    title:
      "‘I do’ turns fatal: Why dowry deaths, violence, false cases are scarring Indian marriages",
    description:
      "Insights from the panel of documentary-maker Deepika Bhardwaj, lawyer-activist Flavia Agnes and couples' therapist Dr Pavan Sonar at the India...",
    image: "/images/media-coverage/featured-news.jpg",
    source: "India TV",
    url: "https://www.indiatv.in/",
    featured: true,
  },
  {
    id: 2,
    category: "Print Media",
    title: "Ekam Nyaay Dialogue – Chandigarh 30 Aug 2026",
    description:
      "India TV: https://www.indiatv.in/punjab/rajya-sabha-mp-...",
    image: "/images/media-coverage/ekam-nyaay.jpg",
    source: "India TV",
    url: "https://www.indiatv.in/",
  },
  {
    id: 3,
    category: "TV",
    title:
      "पुरुष भी अत्याचार के शिकार | महिलाओं पर आरोप | आंकड़े चौंका देंगे | News Nation",
    description: "News Nation discussion featuring Deepika Narayan Bhardwaj.",
    image: "/images/media-coverage/news-nation.jpg",
    source: "News Nation",
    url: "https://www.youtube.com/",
  },
  {
    id: 4,
    category: "TV",
    title:
      "Baruipur Rape-Murder: West Bengal Rapist Shot Dead | Justice Served Or Derailed? | NewsX",
    description: "NewsX panel discussion and media coverage.",
    image: "/images/media-coverage/newsx.jpg",
    source: "NewsX",
    url: "https://www.youtube.com/",
  },
  {
    id: 5,
    category: "TV",
    title: "News9: Siya Goyal Case: Is Male Paranoia Justified?",
    description: "Watch the television discussion and coverage.",
    image: "/images/media-coverage/news9-siya.jpg",
    source: "News9",
    url: "https://www.youtube.com/watch?v=IV9x-3wa-Vg",
  },
  {
    id: 6,
    category: "TV",
    title:
      "IndiaTV: Ketan Agarwal Death Case — रिश्ते तोड़ने से आसान मर्डर क्यों?",
    description: "Panelist: Deepika Narayan Bhardwaj.",
    image: "/images/media-coverage/india-tv-ketan.jpg",
    source: "India TV",
    url: "https://www.youtube.com/",
  },
  {
    id: 7,
    category: "TV",
    title: "NewsX: Pune Lohagad Fort Murder Case: Panelist – Deepika Narayan Bhardwaj",
    description: "NewsX television panel and discussion.",
    image: "/images/media-coverage/newsx-pune.jpg",
    source: "NewsX",
    url: "https://www.youtube.com/",
  },
  {
    id: 8,
    category: "TV",
    title:
      "Deepika Narayan Bhardwaj in Discussion with Navika Kumar @TimesNow",
    description:
      "Discussion about the movie #Bandar and related issues.",
    image: "/images/media-coverage/times-now.jpg",
    source: "Times Now",
    url: "https://www.youtube.com/",
  },
  {
    id: 9,
    category: "Digital Coverage",
    title: "Media coverage on gender-neutral laws and men's rights",
    description: "Articles, discussions and digital media coverage.",
    image: "/images/media-coverage/digital-coverage.jpg",
    source: "Media",
    url: "https://www.google.com/",
  },
  {
    id: 10,
    category: "Print Media",
    title: "Men's rights and gender justice: Newspaper coverage",
    description: "News reports and print media features.",
    image: "/images/media-coverage/print-coverage.jpg",
    source: "Newspaper",
    url: "https://www.google.com/",
  },
];

const filters = ["All", "TV", "Digital Coverage", "Print Media"];

function NewsImage({ src, alt, className = "" }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}

function NewsLabel({ category }) {
  return (
    <div className="mc-category">
      <span className="mc-category-dot" />
      <span>{category}</span>
    </div>
  );
}

function MediaCoverage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(8);

  const featuredNews = mediaNews[0];

  const filteredNews = useMemo(() => {
    if (activeFilter === "All") {
      return mediaNews;
    }

    return mediaNews.filter(
      (item) => item.category === activeFilter
    );
  }, [activeFilter]);

  const currentFeatured =
    filteredNews.find((item) => item.featured) || filteredNews[0];

  const listNews = filteredNews.filter(
    (item) => item.id !== currentFeatured?.id
  );

  const visibleNews = listNews.slice(0, visibleCount);
  const canLoadMore = visibleCount < listNews.length;

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    setVisibleCount(8);
  };

  return (
    <>
    <main className="media-coverage-page">
      {/* =====================================
          HERO BANNER
      ====================================== */}

      <section className="mc-hero">
        <div className="mc-hero-image" />

        <div className="mc-hero-overlay" />

        <div className="mc-hero-title-wrap">
          <h1>In The News</h1>
        </div>
      </section>

      {/* =====================================
          MEDIA CONTENT
      ====================================== */}

      <section className="mc-content">
        <div className="mc-container">

          {/* FILTER BUTTONS */}

          <div
            className="mc-filter-bar"
            role="group"
            aria-label="Filter news by media type"
          >
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`mc-filter-btn ${
                  activeFilter === filter ? "active" : ""
                }`}
                aria-pressed={activeFilter === filter}
                onClick={() => handleFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* FEATURED NEWS + RIGHT SIDE LIST */}

          {currentFeatured && (
            <section className="mc-featured-layout">

              {/* LARGE FEATURED CARD */}

              <article className="mc-featured-card">
                <NewsImage
                  src={currentFeatured.image}
                  alt={currentFeatured.title}
                  className="mc-featured-image"
                />

                <div className="mc-featured-shade" />

                <div className="mc-featured-content">
                  <NewsLabel category={currentFeatured.category} />

                  <h2>{currentFeatured.title}</h2>

                  <p>{currentFeatured.description}</p>

                  <a
                    href={currentFeatured.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mc-read-more"
                  >
                    READ MORE
                    <FiArrowRight />
                  </a>
                </div>
              </article>

              {/* RIGHT NEWS LIST */}

              <div className="mc-featured-list">
                {filteredNews
                  .filter(
                    (item) => item.id !== currentFeatured.id
                  )
                  .slice(0, 3)
                  .map((item) => (
                    <article className="mc-side-news" key={item.id}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mc-side-image-link"
                        aria-label={`Read ${item.title}`}
                      >
                        <NewsImage
                          src={item.image}
                          alt={item.title}
                          className="mc-side-image"
                        />
                      </a>

                      <div className="mc-side-content">
                        <NewsLabel category={item.category} />

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mc-side-title"
                        >
                          {item.title}
                        </a>

                        {item.description && (
                          <p>{item.description}</p>
                        )}
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          )}

          {/* =====================================
              REMAINING NEWS GRID
          ====================================== */}

          <section className="mc-news-grid">
            {visibleNews.map((item) => (
              <article className="mc-grid-news" key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mc-grid-image-link"
                  aria-label={`Read ${item.title}`}
                >
                  <NewsImage
                    src={item.image}
                    alt={item.title}
                    className="mc-grid-image"
                  />
                </a>

                <div className="mc-grid-content">
                  <NewsLabel category={item.category} />

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mc-grid-title"
                  >
                    {item.title}
                  </a>

                  {item.description && (
                    <p>{item.description}</p>
                  )}
                </div>
              </article>
            ))}
          </section>

          {/* =====================================
              DONATION / CONTRIBUTION BANNER
          ====================================== */}

          <section className="mc-donation-banner">
            <div className="mc-donation-pattern" />

            <div className="mc-donation-content">
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

              <Link to="/contact" className="mc-donation-btn">
                <FiHeart />
                <span>Yes! I Want to help</span>
              </Link>
            </div>

            <div className="mc-donation-image-wrap">
              <NewsImage
                src="/images/media-coverage/donation-hands.jpg"
                alt="Hands holding a heart to represent support"
                className="mc-donation-image"
              />
            </div>
          </section>

          {/* =====================================
              LOAD MORE
          ====================================== */}

          {canLoadMore && (
            <div className="mc-load-more-wrap">
              <button
                type="button"
                className="mc-load-more-btn"
                onClick={() =>
                  setVisibleCount((count) => count + 4)
                }
              >
                LOAD MORE
                <FiRefreshCw />
              </button>
            </div>
          )}

          {!filteredNews.length && (
            <div className="mc-empty-state">
              <h3>No media coverage found</h3>
              <p>Try selecting a different media category.</p>

              <button
                type="button"
                className="mc-filter-btn active"
                onClick={() => handleFilter("All")}
              >
                View All
              </button>
            </div>
          )}

        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}

export default MediaCoverage;
