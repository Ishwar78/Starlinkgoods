
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Founder.css";
import Footer from "../components/Footer";

const aboutLinks = [
  { label: "About Us", to: "/about" },
  { label: "What We Do", to: "/what-we-do" },
  { label: "Founder", to: "/founder" },
  { label: "Our Team", to: "/our-team" },
];

const founderHeroSlides = [
  {
    image: "/banner.png",
    alt: "Foundation and community awareness",
  },
  // {
  //   image: "/images/founder-hero-2.jpg",
  //   alt: "People working together for social awareness",
  // },
  // {
  //   image: "/images/founder-hero-3.jpg",
  //   alt: "Community gathering",
  // },
];

function FounderHeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide(
        (current) => (current + 1) % founderHeroSlides.length
      );
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      className="founder-hero-slider"
      aria-label="Foundation image gallery"
    >
      {founderHeroSlides.map((slide, index) => (
        <img
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          className={`founder-hero-slide ${
            activeSlide === index ? "is-active" : ""
          }`}
          aria-hidden={activeSlide !== index}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}

      <div className="founder-hero-dots">
        {founderHeroSlides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            className={`founder-hero-dot ${
              activeSlide === index ? "is-active" : ""
            }`}
            onClick={() => setActiveSlide(index)}
            aria-label={`Show hero image ${index + 1}`}
            aria-pressed={activeSlide === index}
          />
        ))}
      </div>
    </section>
  );
}

export default function Founder() {
  return (
    <main className="founder-page">
      {/* Image-only hero slider */}
      <FounderHeroSlider />

      {/* About navigation */}
      <nav className="founder-subnav" aria-label="About navigation">
        {aboutLinks.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end
            className={({ isActive }) =>
              `founder-subnav-link${isActive ? " active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Founder profile */}
      <section
        className="founder-profile"
        aria-labelledby="founder-name"
      >
        <div className="founder-profile-image-wrap">
          <div className="founder-profile-image-frame">
            <img
              src="/download.png"
              alt="Founder of Ekam Nyaay Foundation"
              className="founder-profile-image"
              loading="lazy"
            />
          </div>
        </div>

        <div className="founder-profile-content">
          <p>
            Deepika Narayan Bhardwaj is an Indian journalist,
            documentary filmmaker, and men's rights activist from
            Gurgaon, Haryana. She advocates for the protection of
            men's rights and highlights issues involving false
            accusations, domestic violence, and crimes affecting men.
          </p>

          <p>
            Her documentary films focus on gender politics and their
            intersection with law, justice, culture, society, and
            institutions. Her work explores often-overlooked aspects
            of gender issues from different perspectives, with
            particular attention to research, facts, and statistics.
          </p>

          <p>
            In 2010, she was selected as one of ten journalists from
            around the world to attend the Future Media Leaders Course
            organized by the Thomson Foundation in the UK. Her work
            reflects an effort to encourage understanding of the
            struggles and experiences of people across genders.
          </p>

          <div className="founder-profile-identity">
            <h1 id="founder-name"> esrgdfvdrfc</h1>
            <p className="founder-designation">Founder</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
