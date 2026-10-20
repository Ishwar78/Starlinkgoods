
import React, { useState } from "react";
import { FiArrowRight, FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./OurImpact.css";
import Footer from "../components/Footer";
const impactStories = [
  {
    id: 1,
    image: "/impact-case-success.png",
    imageAlt: "Message sharing a successful case outcome",
    title:
      "Man Saved from a False Case of Rape on the Promise of Marriage by a False Rape Case Filer",
    description:
      "In 2024, a man approached Ekam Nyaay Foundation after he was named in a rape complaint linked to an alleged false promise of marriage. The allegation threatened his liberty, reputation, and future, leaving him to navigate a legal process alone. Our team listened and began gathering the facts. During this process, we learned of two other rape cases reportedly filed by the same...",
    fullDescription:
      "In 2024, a man approached Ekam Nyaay Foundation after he was named in a rape complaint linked to an alleged false promise of marriage. The allegation threatened his liberty, reputation, and future, leaving him to navigate a legal process alone. Our team listened and began gathering the facts. During this process, we learned of two other rape cases reportedly filed by the same complainant. The matter highlights the importance of examining evidence carefully and ensuring a fair legal process for everyone involved.",
  },
  {
    id: 2,
    image: "/impact-family-case.png",
    imageAlt: "Photograph associated with a family justice case",
    title:
      "FIR Registration against Wife for Pushing Husband to Suicide.",
    description:
      "For two years, a grieving family searched for the simple dignity of being heard. After the death by suicide of the brother of Karn in December of 2023, their efforts to have a First Information Report registered met repeated obstacles. Rishi Trivedi took his own life due to unbearable harassment by his wife, Shikha Awasthi. What should have been the beginning of a fair...",
    fullDescription:
      "For two years, a grieving family searched for the simple dignity of being heard. After the death by suicide of the brother of Karn in December of 2023, their efforts to have a First Information Report registered met repeated obstacles. Rishi Trivedi took his own life due to unbearable harassment by his wife, Shikha Awasthi. The family sought a fair investigation and an opportunity to have their concerns heard through the appropriate legal process.",
  },
];

function ImpactStory({ story, reverse = false }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className={`impact-story ${
        reverse ? "impact-story-reverse" : ""
      }`}
    >
      <div className="impact-story-image">
        <img
          src={story.image}
          alt={story.imageAlt}
          loading="lazy"
        />
      </div>

      <div className="impact-story-content">
        <div className="impact-story-pattern" aria-hidden="true" />

        <div className="impact-story-content-inner">
          <h2>{story.title}</h2>

          <p>
            {expanded ? story.fullDescription : story.description}
          </p>

          <button
            type="button"
            className="impact-read-more"
            onClick={() => setExpanded((previous) => !previous)}
            aria-expanded={expanded}
          >
            {expanded ? "READ LESS" : "READ MORE"}
            <FiArrowRight
              className={expanded ? "impact-arrow-back" : ""}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function OurImpact() {
  return (
    <>
    <main className="our-impact-page">
      {/* HERO */}
      <section className="impact-hero">
        <div className="impact-hero-overlay" />

        <div className="impact-hero-heading">
          <h1>Our Impact</h1>
        </div>
      </section>

      {/* IMPACT STORIES */}
      <section className="impact-stories-section">
        <div className="impact-stories-list">
          {impactStories.map((story, index) => (
            <ImpactStory
              key={story.id}
              story={story}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      </section>

      {/* DONATION CTA */}
      <section className="impact-donation-section">
        <div className="impact-donation-card">
          <div className="impact-donation-pattern" />

          <div className="impact-donation-content">
            <span className="impact-donation-eyebrow">
              BE A PART OF THE CHANGE
            </span>

            <h2>
              Interested in contributing towards
              <br className="impact-desktop-break" /> Men Rights?
            </h2>

            <p>
              Support our mission to advocate for gender-neutral laws
              and raise awareness about issues faced by men with your
              donation today.
            </p>

            <Link
              to="/donate"
              className="impact-donation-button"
            >
              <FiHeart />
              <span>Yes! I Want to help</span>
              <FiArrowRight className="impact-donation-arrow" />
            </Link>
          </div>

          <div className="impact-donation-image">
            <img
              src="/impact-donation-hands.png"
              alt="Hands holding a heart"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </main>

    <Footer />
    </>
  );
}
