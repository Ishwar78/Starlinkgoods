import React from "react";
import {
  FiArrowRight,
  FiAward,
  FiEye,
  FiHeart,
  FiPackage,
  FiShield,
  FiTarget,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import "./About.css";
import Footer from "../components/Footer";

const benefits = [
  {
    icon: <FiAward />,
    title: "Premium Quality",
    text: "Carefully selected furniture",
  },
  {
    icon: <FiTruck />,
    title: "Delivery You Can Trust",
    text: "Convenient delivery to your doorstep",
  },
  {
    icon: <FiUsers />,
    title: "Customer First",
    text: "Support when you need it",
  },
  {
    icon: <FiUsers />,
    title: "Thoughtful Choices",
    text: "Better choices for your home",
  },
];

const values = [
  {
    icon: <FiTarget />,
    title: "Our Mission",
    text: "To make stylish, comfortable furniture accessible for everyday living.",
  },
  {
    icon: <FiEye />,
    title: "Our Vision",
    text: "To become a trusted destination for furniture and home essentials.",
  },
  {
    icon: <FiHeart />,
    title: "Our Values",
    text: "Quality, comfort, thoughtful design and customer satisfaction.",
  },
  {
    icon: <FiHeart />,
    title: "Responsibility",
    text: "Encouraging mindful choices for more comfortable homes.",
  },
];

const reasons = [
  {
    icon: <FiPackage />,
    title: "A Thoughtful Collection",
    text: "Furniture for living rooms, bedrooms, dining spaces and more.",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    icon: <FiTruck />,
    title: "Convenient Shopping",
    text: "A simple browsing experience to help you find your next favourite piece.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85",
  },
  {
    icon: <FiShield />,
    title: "Quality Focus",
    text: "Comfort, useful design and lasting appeal at the heart of our collection.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
  },
  {
    icon: <FiUsers />,
    title: "Here for You",
    text: "We want every step of your furniture shopping journey to feel straightforward.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    initials: "PS",
    text: "The collection made it easy to explore different looks and find inspiration for my living room.",
  },
  {
    name: "Rahul Mehta",
    initials: "RM",
    text: "I liked the variety of furniture styles and how simple the browsing experience felt.",
  },
  {
    name: "Sneha Kapoor",
    initials: "SK",
    text: "A lovely place to discover ideas for making a home feel more comfortable and personal.",
  },
];

const brands = [
  "IKEA",
  "Sleepwell",
  "Durian",
  "Godrej",
  "pepperfry",
  "Nilkamal",
  "Urban Ladder",
  "HomeTown",
];

function Eyebrow({ children }) {
  return <span className="slg-about-eyebrow">{children}</span>;
}

function AboutButton({ href = "#categories", children }) {
  return (
    <a className="slg-about-button" href={href}>
      <span>{children}</span>
      <FiArrowRight />
    </a>
  );
}

function LinklessStat({ icon, title, text }) {
  return (
    <article className="slg-about-stat">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </article>
  );
}

export default function About() {
  return (
    <>
   
    <main className="slg-about-page">
      {/* Hero Section */}
      <section className="slg-about-hero" id="about">
        <div
          className="slg-about-hero-image"
          role="img"
          aria-label="Warm modern living room"
        />

        <div className="slg-about-hero-content">
          <Eyebrow>ABOUT STAR LINK GOODS</Eyebrow>

          <h1>
            Furniture for
            <span>Better Living.</span>
          </h1>

          <p>
            At Star Link Goods, we believe a well-furnished home
            creates a happier, more comfortable life. Discover
            stylish furniture and inspiring pieces for the spaces
            you love.
          </p>

          <AboutButton href="#our-story">
            Discover Our Story
          </AboutButton>
        </div>

        <div className="slg-about-hero-note">
          <span>Make</span>
          <span>Every Space</span>
          <span>Special.</span>
          <i />
        </div>
      </section>

      {/* Benefits Section */}
      <section
        className="slg-about-benefits"
        aria-label="Our commitments"
      >
        {benefits.map((item) => (
          <article
            className="slg-about-benefit"
            key={item.title}
          >
            <span className="slg-about-benefit-icon">
              {item.icon}
            </span>

            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Our Story */}
      <section className="slg-about-story" id="our-story">
        <div className="slg-about-story-visual">
          <img
            className="slg-about-story-main-image"
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
            alt="Elegant dining and living space"
            loading="lazy"
          />

          <img
            className="slg-about-story-small-image"
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=85"
            alt="Contemporary sofa"
            loading="lazy"
          />

          <div className="slg-about-image-caption">
            <span>Thoughtful interiors</span>
            <strong>Made for everyday living</strong>
          </div>
        </div>

        <div className="slg-about-story-copy">
          <Eyebrow>OUR STORY</Eyebrow>

          <h2>
            Creating Beautiful Homes Across Every Generation
          </h2>

          <p>
            Star Link Goods brings together furniture inspiration
            for modern homes. From inviting sofas and restful
            bedrooms to practical storage and dining essentials,
            our goal is to help you create spaces that feel
            comfortable, functional and distinctly yours.
          </p>

          <p>
            Great interiors are not just about appearance. They
            are about the everyday moments, conversations and
            memories that happen around the furniture you choose.
          </p>

          <AboutButton href="#our-values">
            Explore What Matters
          </AboutButton>
        </div>

        <div className="slg-about-stats">
          <LinklessStat
            icon={<FiHeart />}
            title="Comfort"
            text="At the heart of every room"
          />

          <LinklessStat
            icon={<FiPackage />}
            title="Wide Choice"
            text="Furniture for every space"
          />

          <LinklessStat
            icon={<FiAward />}
            title="Thoughtful Design"
            text="Style meets function"
          />

          <LinklessStat
            icon={<FiUsers />}
            title="Customer Focus"
            text="Your home, your way"
          />
        </div>
      </section>

      {/* Mission, Vision and Values */}
      <section className="slg-about-values" id="our-values">
        {values.map((item) => (
          <article
            className="slg-about-value"
            key={item.title}
          >
            <span className="slg-about-value-icon">
              {item.icon}
            </span>

            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Why Choose Star Link Goods */}
      <section className="slg-about-why">
        <div className="slg-about-why-intro">
          <Eyebrow>THE SLG DIFFERENCE</Eyebrow>

          <h2>More Than Just Furniture</h2>

          <p>
            The right furniture brings a room together. Explore
            pieces that balance comfort, useful design and
            timeless style.
          </p>

          <AboutButton href="#categories">
            Explore Collection
          </AboutButton>
        </div>

        <div className="slg-about-reasons">
          {reasons.map((item) => (
            <article
              className="slg-about-reason-card"
              key={item.title}
            >
              <div className="slg-about-reason-image">
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                />

                <span>{item.icon}</span>
              </div>

              <div className="slg-about-reason-copy">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Brand Showcase */}
      <section
        className="slg-about-brands"
        aria-label="Furniture inspiration"
      >
        <div className="slg-about-brands-label">
          <span />
          <strong>FURNITURE INSPIRATION</strong>
        </div>

        <div className="slg-about-brand-list">
          {brands.map((brand) => (
            <span key={brand}>{brand}</span>
          ))}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="slg-about-testimonials">
        <div className="slg-about-testimonials-heading">
          <Eyebrow>HOME STORIES</Eyebrow>

          <h2>Ideas for Spaces You'll Love</h2>

          <p>
            Every home is different. Discover furniture that
            suits your style and everyday life.
          </p>
        </div>

        <div className="slg-about-testimonial-grid">
          {testimonials.map((item) => (
            <article
              className="slg-about-testimonial"
              key={item.name}
            >
              <div className="slg-about-reviewer">
                <span>{item.initials}</span>

                <div>
                  <strong>{item.name}</strong>
                  <small>Home design enthusiast</small>
                </div>
              </div>

              <div
                className="slg-about-stars"
                aria-label="Decorative star rating"
              >
                ★★★★★
              </div>

              <p>“{item.text}”</p>
            </article>
          ))}
        </div>
      </section>

      {/* Final Shopping CTA */}
      <section className="slg-about-cta">
        <div
          className="slg-about-cta-image"
          role="img"
          aria-label="Beautiful contemporary living room"
        />

        <div className="slg-about-cta-copy">
          <Eyebrow>LET'S MAKE YOURSELF AT HOME</Eyebrow>

          <h2>
            Discover Furniture That Feels Like Home
          </h2>

          <p>
            Explore furniture and home essentials to bring
            comfort, style and personality into your favourite
            spaces.
          </p>

          <AboutButton href="#categories">
            Shop the Collection
          </AboutButton>
        </div>
      </section>
    </main>
    {/* <Footer /> */}
     </>
  );
}