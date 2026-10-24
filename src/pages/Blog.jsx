
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import Footer from "../components/Footer";
import "./Blog.css";

/*
  Images ko public/blog/ folder mein rakho.
  Public folder ki files ko /blog/filename.jpg se access kar sakte ho.
*/

const heroSlides = [
  {
    title: "Blogs",
    image: "/banner.png",
    alt: "Community raising their hands at sunset",
  },
  {
    title: "Latest Updates",
    image: "/banner1.png",
    alt: "Community awareness and public participation",
  },
  {
    title: "Our Stories",
    image: "/banner2.png",
    alt: "People standing together for social awareness",
  },
];

const latestUpdates = [
  {
    id: 1,
    category: "Org Update",
    date: "Sep 3, 2026",
    title:
      "Keynote Address: Justice Rajesh Bindal At Ekam Nyaay Dialogue Chandigarh 2026",
    description:
      'FALSELY ACCUSED MEN AND THEIR FAMILIES ARE VICTIMS OF PROCESS: JUSTICE RAJESH BINDAL AT EKAM NYAAY DIALOGUE CHANDIGARH. Keynote address by Justice Rajesh Bindal. Full text of speech...',
    image: "/blog.avif",
    imageAlt: "Justice Rajesh Bindal speaking at a public event",
    link: "/blog/justice-rajesh-bindal",
  },
  {
    id: 2,
    category: "Blogs",
    date: "Mar 24, 2026",
    title:
      "Child Guardianship Policy For Schools In Cases Of Divorced And Separated Parents",
    description:
      "Child Custody Policy book. Download sample letter email to school — divorced and separated parents. Read about the guardianship policy and related resources...",
    image: "/blog1.avif",
    imageAlt: "Child guardianship policy for schools",
    link: "/blog/child-guardianship-policy",
  },
  {
    id: 3,
    category: "Blogs",
    date: "Sep 14, 2026",
    title: "When A Justice System Learns To Tolerate Lies",
    description:
      "Date: 11th September 2026. Introduction: What happens when a justice system becomes so accustomed to a problem that the explanations for not fixing it start reinforcing the problem itself? India's culture of lying...",
    image: "/blog2.avif",
    imageAlt: "Editorial illustration about justice and evidence",
    link: "/blog/when-a-justice-system-learns-to-tolerate-lies",
  },
  {
    id: 4,
    category: "Blogs",
    date: "Jul 28, 2026",
    title: "Divorce In Two Countries, What No One Tells You",
    description:
      "An NRI husband's account after years of dealing with divorce proceedings across countries. Read about the practical challenges, legal processes and difficult questions families may face...",
    image: "/blog.avif",
    imageAlt: "Editorial illustration about divorce in two countries",
    link: "/blog/divorce-in-two-countries",
  },
  {
    id: 5,
    category: "Org Update",
    date: "Aug 12, 2026",
    title: "Community Awareness And Public Engagement Initiatives",
    description:
      "Updates on awareness initiatives, community participation and ongoing efforts to encourage informed conversations and access to useful resources...",
    image: "/blog1.avif",
    imageAlt: "Community awareness initiative",
    link: "/blog/community-awareness",
  },
];

const Blog = () => {
  const [heroIndex, setHeroIndex] = useState(0);
  const [latestIndex, setLatestIndex] = useState(0);

  // Hero image slider
  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  // Latest Updates slider
  useEffect(() => {
    const timer = window.setInterval(() => {
      setLatestIndex((current) => (current + 1) % latestUpdates.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const previousHero = () => {
    setHeroIndex(
      (current) => (current - 1 + heroSlides.length) % heroSlides.length
    );
  };

  const nextHero = () => {
    setHeroIndex((current) => (current + 1) % heroSlides.length);
  };

  const previousLatest = () => {
    setLatestIndex(
      (current) =>
        (current - 1 + latestUpdates.length) % latestUpdates.length
    );
  };

  const nextLatest = () => {
    setLatestIndex((current) => (current + 1) % latestUpdates.length);
  };

  const currentHero = heroSlides[heroIndex];
  const currentLatest = latestUpdates[latestIndex];

  return (
<>

    <main className="blog-page">
      {/* ================= HERO SLIDER ================= */}
      <section
        className="blog-hero"
        aria-label="Blog page banner"
      >
        {heroSlides.map((slide, index) => (
          <div
            className={`blog-hero-slide ${
              heroIndex === index ? "active" : ""
            }`}
            key={slide.image}
            aria-hidden={heroIndex !== index}
          >
            <img
              className="blog-hero-image"
              src={slide.image}
              alt={slide.alt}
              fetchPriority={index === 0 ? "high" : "auto"}
            />
          </div>
        ))}

        <div className="blog-hero-overlay" />

        <div className="blog-hero-content">
          <h1 key={currentHero.title}>{currentHero.title}</h1>
        </div>

        <div className="blog-hero-controls">
          <button
            type="button"
            onClick={previousHero}
            aria-label="Previous banner"
          >
            <FiChevronLeft />
          </button>

          <button
            type="button"
            onClick={nextHero}
            aria-label="Next banner"
          >
            <FiChevronRight />
          </button>
        </div>

        <div
          className="blog-hero-dots"
          aria-label="Choose banner"
        >
          {heroSlides.map((slide, index) => (
            <button
              type="button"
              key={slide.image}
              className={heroIndex === index ? "active" : ""}
              onClick={() => setHeroIndex(index)}
              aria-label={`Show banner ${index + 1}`}
              aria-current={heroIndex === index ? "true" : undefined}
            />
          ))}
        </div>
      </section>

      {/* ================= LATEST UPDATES ================= */}
      <section className="latest-updates-section">
        <div className="latest-updates-container">
          <div className="blog-section-heading dark-heading">
            <h2>
              Latest <span>Updates</span>
            </h2>
          </div>

          <div
            className="latest-update-card"
            key={currentLatest.id}
          >
            <a
              className="latest-update-image"
              href={currentLatest.link}
              aria-label={`Read ${currentLatest.title}`}
            >
              <img
                src={currentLatest.image}
                alt={currentLatest.imageAlt}
                loading="lazy"
              />
            </a>

            <div className="latest-update-content">
              <div className="blog-meta blog-meta-dark">
                <span>{currentLatest.category}</span>
                <span>{currentLatest.date}</span>
              </div>

              <h3>
                <a href={currentLatest.link}>
                  {currentLatest.title}
                </a>
              </h3>

              <p>{currentLatest.description}</p>

              <a
                className="blog-read-more"
                href={currentLatest.link}
              >
                READ MORE <FiChevronRight />
              </a>
            </div>
          </div>

          <div className="latest-slider-footer">
            <button
              className="latest-arrow"
              type="button"
              onClick={previousLatest}
              aria-label="Previous latest update"
            >
              <FiChevronLeft />
            </button>

            <div
              className="latest-slider-dots"
              aria-label="Choose latest update"
            >
              {latestUpdates.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  className={latestIndex === index ? "active" : ""}
                  onClick={() => setLatestIndex(index)}
                  aria-label={`Show update ${index + 1}`}
                  aria-current={latestIndex === index ? "true" : undefined}
                >
                  <span />
                </button>
              ))}
            </div>

            <button
              className="latest-arrow"
              type="button"
              onClick={nextLatest}
              aria-label="Next latest update"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* ================= ALL BLOGS ================= */}
      <section className="blog-list-section" id="all-blogs">
        <div className="blog-list-container">
          <div className="blog-section-heading light-heading">
            <h2>
              Explore Our <span>Blogs</span>
            </h2>
            <p>
              Articles, stories, resources and the latest updates.
            </p>
          </div>

          {/* No category filter buttons, as requested */}
          <div className="blog-list">
            {latestUpdates.map((post) => (
              <article className="blog-list-card" key={post.id}>
                <a
                  className="blog-list-image"
                  href={post.link}
                  aria-label={`Read ${post.title}`}
                >
                  <img
                    src={post.image}
                    alt={post.imageAlt}
                    loading="lazy"
                  />
                </a>

                <div className="blog-list-content">
                  <div className="blog-meta blog-meta-light">
                    <span>{post.category}</span>
                    <span>{post.date}</span>
                  </div>

                  <h3>
                    <a href={post.link}>{post.title}</a>
                  </h3>

                  <p>{post.description}</p>

                  <a
                    className="blog-read-more"
                    href={post.link}
                  >
                    READ MORE <FiChevronRight />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <a className="blog-back-top" href="#all-blogs">
            Back to Blogs <FiArrowRight />
          </a>
        </div>
      </section>
    </main>
   <Footer />
      </>
  );
};

export default Blog;
