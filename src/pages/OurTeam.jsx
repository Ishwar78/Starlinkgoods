
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiLinkedin,
} from "react-icons/fi";
import "./OurTeam.css";
import Footer from "../components/Footer";

const aboutLinks = [
  { label: "About Us", to: "/about" },
  { label: "What We Do", to: "/what-we-do" },
  { label: "Founder", to: "/founder" },
  { label: "Our Team", to: "/our-team" },
];

const teamHeroSlides = [
  {
    image: "/images/team-hero.jpg",
    alt: "Ekam Nyaay Foundation team banner",
  },
  {
    image: "/images/team-hero-2.jpg",
    alt: "Ekam Nyaay Foundation initiatives",
  },
  {
    image: "/images/team-hero-3.jpg",
    alt: "Ekam Nyaay Foundation community work",
  },
];

function TeamHeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % teamHeroSlides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="team-hero-slider"
      aria-label="Our Team image slider"
    >
      {teamHeroSlides.map((slide, index) => (
        <img
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          className={`team-hero-slide ${
            activeSlide === index ? "is-active" : ""
          }`}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}

      <div className="team-hero-dots" aria-label="Choose banner image">
        {teamHeroSlides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            className={`team-hero-dot ${
              activeSlide === index ? "is-active" : ""
            }`}
            onClick={() => setActiveSlide(index)}
            aria-label={`Show banner ${index + 1}`}
            aria-pressed={activeSlide === index}
          />
        ))}
      </div>
    </section>
  );
}

const teamMembers = [
  {
    id: "harsh",
    name: "Adv. Harsh Asija",
    role: "Legal Counselling & Research",
    image: "/images/harsh-asija.jpg",
    imageAlt: "Advocate Harsh Asija",
    theme: "gold",
    linkedin: "",
    description:
      "Harsh is deeply engaged in understanding how law impacts real lives beyond courtrooms and judgments. With a strong focus on legal research, case analysis, and counselling, he works closely with men implicated in false rape cases, helping them navigate legal complexities with clarity and confidence. His work reflects a commitment to fairness, due process, and responsible use of law.",
    fullDescription:
      "His approach emphasizes careful research, a compassionate understanding of individual circumstances, and awareness of the legal processes available to people facing difficult situations. Through his work, he aims to support informed decision-making and promote fairness, dignity, and access to appropriate guidance.",
  },
  {
    id: "rohit",
    name: "Rohit Kumar",
    role: "Counselling and Project Lead",
    image: "/images/rohit-kumar.jpg",
    imageAlt: "Rohit Kumar",
    theme: "dark",
    linkedin: "",
    description:
      "Rohit is passionate about the digital world and the complexities of law and society. He brings an analytical mindset and a people-focused approach to his work, connecting technology, research, and counselling initiatives to help individuals facing challenging circumstances.",
    fullDescription:
      "As Counselling and Project Lead, he contributes to coordinating initiatives, understanding individual concerns, and supporting projects that encourage awareness and constructive social change. His work is guided by empathy, collaboration, and a commitment to helping people move forward with confidence.",
  },
];

function TeamMemberCard({ member, index }) {
  const [expanded, setExpanded] = useState(false);
  const isDark = member.theme === "dark";

  return (
    <article
      className={`team-member-card ${
        isDark ? "team-card-dark" : "team-card-gold"
      } ${index % 2 === 1 ? "team-card-reverse" : ""}`}
    >
      <div className="team-member-photo-column">
        <div className="team-member-photo-frame">
          <img
            src={member.image}
            alt={member.imageAlt}
            className="team-member-photo"
            loading="lazy"
          />
        </div>
      </div>

      <div className="team-member-information">
        <div className="team-member-biography">
          <p>{member.description}</p>

          {expanded && (
            <p className="team-member-extra-description">
              {member.fullDescription}
            </p>
          )}
        </div>

        <button
          type="button"
          className="team-read-more"
          onClick={() => setExpanded((previous) => !previous)}
          aria-expanded={expanded}
          aria-controls={`team-extra-${member.id}`}
        >
          {expanded ? "READ LESS" : "READ MORE"}
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        <div
          className="team-member-identity"
          id={`team-extra-${member.id}`}
        >
          <h2>{member.name}</h2>
          <p>{member.role}</p>
        </div>

        {member.linkedin && (
          <a
            className="team-linkedin"
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on LinkedIn`}
          >
            <FiLinkedin />
          </a>
        )}
      </div>
    </article>
  );
}

export default function OurTeam() {
  return (
    <main className="our-team-page">
      {/* Hero image slider */}
      <TeamHeroSlider />

      <nav className="team-subnav" aria-label="About navigation">
        {aboutLinks.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end
            className={({ isActive }) =>
              `team-subnav-link${isActive ? " active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <header className="team-page-heading">
        <h1>
          Meet <span>Our Team</span>
        </h1>
        <p>
          Meet the people working towards justice, awareness, and a
          more equitable society through research, counselling, and
          community initiatives.
        </p>
      </header>

      <section
        className="team-members-list"
        aria-label="Our team members"
      >
        {teamMembers.map((member, index) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            index={index}
          />
        ))}
      </section>

      <Footer />
    </main>
  );
}
