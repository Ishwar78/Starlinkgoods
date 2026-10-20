
import React, { useState } from "react";
import { FiArrowRight, FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./MakingADifference.css";

import Footer from "../components/Footer";

const stories = [
  {
    id: 1,
    title:
      "National Boxer to False POCSO Case Survivor! Crowd Funding for Krishna Sharma to rebuild his Boxing Academy.",
    image: "/difference-boxer.png",
    imageAlt: "Boxing academy rebuilding and support story",
    description:
      "Krishan Sharma once represented India in international boxing competitions, turning discipline, talent, and determination into a source of pride for his community. He later built a boxing academy in Hisar, Haryana, where he trained young athletes from modest backgrounds and helped them pursue...",
    fullDescription:
      "Krishan Sharma once represented India in international boxing competitions, turning discipline, talent, and determination into a source of pride for his community. He later built a boxing academy in Hisar, Haryana, where he trained young athletes from modest backgrounds and helped them pursue their sporting ambitions. Following a difficult legal battle, support was needed to help him rebuild his academy and continue creating opportunities for young boxers.",
  },
  {
    id: 2,
    title:
      "Wife and Boyfriend booked & chargesheeted for Extortion in Matrimonial Case",
    image: "/difference-fir.png",
    imageAlt: "First Information Report document relating to a case",
    description:
      "In October 2024, Ekam Nyaay Foundation was approached by a man whose wife demanded 1 Crore from him just 1 month after the marriage because he discovered her affair with another man. He was assaulted by his wife & her lover and they threatened to file multiple false cases against him if he did not...",
    fullDescription:
      "In October 2024, Ekam Nyaay Foundation was approached by a man whose wife demanded 1 Crore from him just one month after the marriage because he discovered her affair with another man. He reported being assaulted by his wife and her alleged partner and being threatened with multiple cases. The matter highlights the importance of access to legal support, a fair investigation, and due process.",
  },
];

function DifferenceStory({ story, reverse = false }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className={`difference-story ${
        reverse ? "difference-story-reverse" : ""
      }`}
    >
      <div className="difference-story-content">
        <div className="difference-pattern" aria-hidden="true" />

        <div className="difference-story-inner">
          <h2>{story.title}</h2>

          <p>
            {expanded ? story.fullDescription : story.description}
          </p>

          <button
            type="button"
            className="difference-read-more"
            onClick={() => setExpanded((previous) => !previous)}
            aria-expanded={expanded}
          >
            <span>{expanded ? "READ LESS" : "READ MORE"}</span>
            <FiArrowRight
              className={expanded ? "difference-arrow-back" : ""}
            />
          </button>
        </div>
      </div>

      <div className="difference-story-image">
        <img
          src={story.image}
          alt={story.imageAlt}
          loading="lazy"
        />
      </div>
    </article>
  );
}

export default function MakingADifference() {
  return (
    <>
    <main className="making-difference-page">
      {/* Hero Banner */}
      <section className="difference-hero">
        <div className="difference-hero-overlay" />

        <div className="difference-hero-title">
          <h1>Making A Difference</h1>
        </div>
      </section>

      {/* Impact Stories */}
      <section
        className="difference-stories-section"
        aria-label="Stories of making a difference"
      >
        <div className="difference-stories-list">
          {stories.map((story, index) => (
            <DifferenceStory
              key={story.id}
              story={story}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      </section>

      {/* Donation Banner */}
      <section className="difference-donation-section">
        <div className="difference-donation-card">
          <div
            className="difference-donation-pattern"
            aria-hidden="true"
          />

          <div className="difference-donation-content">
            <h2>
              Interested in contributing towards
              <br className="difference-desktop-break" /> Men Rights?
            </h2>

            <p>
              Support our mission to advocate for gender-neutral laws
              and raise awareness about issues faced by men with your
              donation today.
            </p>

            <Link
              to="/donate"
              className="difference-donation-button"
            >
              <FiHeart />
              <span>Yes! I Want to help</span>
            </Link>
          </div>

          <div className="difference-donation-image">
            <img
              src="/difference-donation.png"
              alt="Hands holding a heart as a symbol of support"
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
