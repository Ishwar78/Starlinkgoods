import React, { useState } from "react";
import "./Testimonials.css";

import Footer from "../components/Footer";

const testimonials = [
  {
    id: 1,
    name: "Matrimonial Dispute Victim",
    text: "Mam it may sound cliche But you saved my marriage ! I badly wanted to start a family coz I don't have many ppl is my familyI couldn't even think of it until the case is overBut now im relievedAnd we have a daughter I'm going to name her Deepika 🙏🏻Thank you for being the light in my life 🙏🏻🙏🏻🙏🏻",
  },
  {
    id: 2,
    name: "Hemant Nayyar",
    text: "I want to express my deepest and most heartfelt gratitude for the support and kindness you have shown me during a very important and challenging time in my life. Your efforts to help me with a job opportunity, as well as your support regarding my case, mean much more to me than I can put into words. At a time when I needed guidance and encouragement, your help made a meaningful difference in my life. Thank you for standing by me.",
  },
  {
    id: 3,
    name: "Victim of False POCSO Accusation",
    text: "Dear Deepika Mam ... This couldn't have been possible, if u weren't there in the background somewhere in my life. After POCSO allegations that too against my own child, & when I used to visit my child alone at Prayagraj with 0 contacts, with many filthy complaints against me in an unknown City, back of the mind I always had that you would guide me through this difficult time. Your support and guidance meant a lot to me.",
  },
  {
    id: 4,
    name: "Share Your Experience",
    text: "This testimonial card is ready for your next real testimonial. Replace this text and name with the original feedback you want to publish on your website.",
  },
  {
    id: 5,
    name: "Member Testimonial",
    text: "Add the next original testimonial here. You can include the complete feedback and the name or approved display title of the person sharing their experience.",
  },
  {
    id: 6,
    name: "Community Testimonial",
    text: "Add another testimonial to share a genuine experience from your community. The full message will be available through the Read More option.",
  },
  {
    id: 7,
    name: "Client Testimonial",
    text: "Add your original client feedback here. Each testimonial will appear in the same rounded cream card design, with the thumbs-up image and expandable text.",
  },
  {
    id: 8,
    name: "Support Testimonial",
    text: "Add another approved testimonial here. Visitors can read the complete message and use Load More to explore additional testimonials.",
  },
];

const INITIAL_VISIBLE = 4;
const LOAD_MORE_COUNT = 4;
const PREVIEW_LENGTH = 205;

function TestimonialCard({ testimonial }) {
  const [expanded, setExpanded] = useState(false);

  const isLong = testimonial.text.length > PREVIEW_LENGTH;

  const displayedText =
    isLong && !expanded
      ? `${testimonial.text.slice(0, PREVIEW_LENGTH).trimEnd()}...`
      : testimonial.text;

  return (
    <article className="iw-testimonial-card">
      {/* Left: Thumb Image */}
      <div className="iw-testimonial-image-column">
        <div className="iw-testimonial-image-ring">
          <img
            src="/download1.png"
            alt="Thumbs up"
            className="iw-testimonial-thumb-image"
            loading="lazy"
          />
        </div>
      </div>

      {/* Center: Testimonial */}
      <div className="iw-testimonial-content">
        <p className="iw-testimonial-text">{displayedText}</p>

        {isLong && (
          <button
            type="button"
            className="iw-testimonial-read-more"
            onClick={() => setExpanded((previous) => !previous)}
            aria-expanded={expanded}
          >
            {expanded ? "READ LESS" : "READ MORE"}

            <span
              className={`iw-testimonial-read-arrow ${
                expanded ? "iw-testimonial-arrow-up" : ""
              }`}
              aria-hidden="true"
            >
              ⌄
            </span>
          </button>
        )}

        <h3 className="iw-testimonial-author">{testimonial.name}</h3>
      </div>

      {/* Right: Decorative quotation mark */}
      <div className="iw-testimonial-quote" aria-hidden="true">
        ”
      </div>
    </article>
  );
}

export default function Testimonials() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const visibleTestimonials = testimonials.slice(0, visibleCount);

  const hasMore = visibleCount < testimonials.length;

  const handleLoadMore = () => {
    setVisibleCount((previous) =>
      Math.min(previous + LOAD_MORE_COUNT, testimonials.length)
    );
  };

  return (
    <>
      <main className="iw-testimonials-page">
        {/* Hero Banner */}
        <section className="iw-testimonials-hero">
          <div className="iw-testimonials-hero-overlay" />

          <div className="iw-testimonials-hero-title">
            <h1>Testimonials</h1>
          </div>
        </section>

        {/* Testimonials List */}
        <section
          className="iw-testimonials-section"
          aria-label="Testimonials"
        >
          <div className="iw-testimonials-container">
            <div className="iw-testimonials-list">
              {visibleTestimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="iw-testimonials-load-more-wrapper">
                <button
                  type="button"
                  className="iw-testimonials-load-more"
                  onClick={handleLoadMore}
                >
                  <span>Load More</span>
                  <span className="iw-testimonials-load-more-arrow">
                    ↓
                  </span>
                </button>
              </div>
            )}

            {!hasMore && testimonials.length > INITIAL_VISIBLE && (
              <div className="iw-testimonials-end-message">
                <span aria-hidden="true">✦</span>
                <p>You have viewed all testimonials.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}