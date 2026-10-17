
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiArrowUpRight,
  FiHeart,
  FiBookOpen,
  FiUsers,
  FiSearch,
} from "react-icons/fi";

import "./WhatWeDo.css";
import Footer from "../components/Footer";

const aboutLinks = [
  { label: "About Us", to: "/about" },
  { label: "What We Do", to: "/what-we-do" },
  { label: "Founder", to: "/founder" },
  { label: "Our Team", to: "/our-team" },
];

const workHeroSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&w=2000&q=90",
    alt: "People standing together",
  },
  {
    image:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=2000&q=90",
    alt: "Community and justice",
  },
  {
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=2000&q=90",
    alt: "People coming together as a community",
  },
];

const initiatives = [
  {
    id: "counselling",
    title: "Counselling",
    icon: <FiHeart />,
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "A supportive counselling conversation",
    paragraphs: [
      "At Star Link Goods Foundation, we recognize that legal issues can take an extreme toll on an individual's emotional and mental well-being, especially those who are accused of crimes they haven't committed.",
      "Many men caught in these situations feel isolated and overwhelmed. We aim to provide a supportive space where individuals can share their concerns and find guidance during challenging times.",
      "Our counselling initiatives focus on helping individuals express their feelings, process difficult experiences, and explore healthy coping strategies.",
      "We strive to connect people with appropriate support resources and encourage a compassionate approach guided by integrity, respect, and inclusivity.",
      "Through awareness and supportive conversations, we aim to help individuals rebuild their confidence and move forward with hope and resilience.",
    ],
  },
  {
    id: "content",
    title: "Content",
    icon: <FiBookOpen />,
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "People participating in a public awareness gathering",
    paragraphs: [
      "At Star Link Goods Foundation, we harness the power of media to drive social change and advocate for men's rights and gender equality. Our content is designed to raise awareness, educate the public, engage our audience, and encourage informed discussions.",
      "We create informative posts, stories, articles, and videos that explore important social issues and help people understand different perspectives.",
      "Through documentary films, independent journalism, and visual storytelling, we aim to bring attention to issues concerning men and their families, sharing stories that encourage thoughtful conversations.",
      "By leveraging digital platforms and educational resources, we work towards fostering a supportive community and promoting a just and equitable society for all individuals.",
    ],
  },
  {
    id: "intervention",
    title: "Intervention",
    icon: <FiUsers />,
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "People supporting their community",
    paragraphs: [
      "In cases involving significant public interest, Star Link Goods Foundation aims to support affected individuals and families in finding appropriate channels for assistance and justice.",
      "Our intervention efforts focus on understanding individual circumstances, raising awareness about relevant issues, and helping people identify suitable legal and support resources.",
      "We seek to encourage fair investigations, due process, and informed engagement with relevant authorities wherever appropriate.",
      "Through collaboration, public awareness, and community support, we strive to bring meaningful relief to people facing difficult circumstances.",
      "Our aim is to promote practical action, responsible advocacy, and lasting positive change while respecting the rights and dignity of every individual.",
    ],
  },
  {
    id: "research",
    title: "Research",
    icon: <FiSearch />,
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "A researcher reviewing documents",
    paragraphs: [
      "Star Link Goods Foundation focuses on bringing attention to research and reports concerning issues faced by men in society. We believe evidence-based discussion can help people better understand complex social challenges.",
      "We aim to examine available information about men's well-being, family disputes, social inequalities, and other often-overlooked concerns, while recognizing the importance of reliable data and responsible reporting.",
      "Our research initiatives seek to highlight the experiences of affected individuals, the challenges they encounter, and the broader impact these issues can have on families and communities.",
      "We also encourage informed discussions and collaboration with researchers and others working to understand these subjects.",
      "By sharing research and educational material, we aim to increase public awareness and contribute to a society that values fairness, dignity, and equal treatment.",
    ],
  },
];

function WhatWeDoHeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide(
        (current) => (current + 1) % workHeroSlides.length
      );
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      className="ekam-work-hero-slider"
      aria-label="Foundation image gallery"
    >
      {workHeroSlides.map((slide, index) => (
        <img
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          className={`ekam-work-hero-slide ${
            activeSlide === index ? "is-active" : ""
          }`}
          aria-hidden={activeSlide !== index}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}

      <div className="ekam-work-hero-dots">
        {workHeroSlides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            className={`ekam-work-hero-dot ${
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

function InitiativeSection({ item, index }) {
  const imageOnLeft = index % 2 === 0;

  return (
    <section
      className={`ekam-work-row ${
        imageOnLeft
          ? "ekam-work-image-left"
          : "ekam-work-image-right"
      }`}
      id={item.id}
      aria-labelledby={`${item.id}-heading`}
    >
      <div className="ekam-work-visual">
        <div className="ekam-work-orbit">
          <div className="ekam-work-image">
            <img
              src={item.image}
              alt={item.imageAlt}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>

          <span
            className="ekam-work-orbit-dot"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="ekam-work-copy">
        <div className="ekam-work-title-row">
          <span
            className="ekam-work-title-icon"
            aria-hidden="true"
          >
            {item.icon}
          </span>

          <h2 id={`${item.id}-heading`}>{item.title}</h2>
        </div>

        <div className="ekam-work-description">
          {item.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={`${item.id}-${paragraphIndex}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function WhatWeDo() {
  return (
    <main className="ekam-whatwedo-page">
      {/* Hero image slider */}
      <WhatWeDoHeroSlider />

      {/* Four navigation buttons */}
      <nav
        className="ekam-work-subnav"
        aria-label="About section navigation"
      >
        {aboutLinks.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end
            className={({ isActive }) =>
              `ekam-work-subnav-link${
                isActive ? " active" : ""
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Page introduction */}
      <header className="ekam-work-intro">
        <h1 className="ekam-work-main-heading">
          What <span>We Do</span>
        </h1>

        <p>
          Star Link Goods Foundation is dedicated to promoting
          gender equality and addressing pressing social issues.
          Our work is guided by integrity, compassion, and
          inclusivity. We strive to support individuals affected
          by difficult circumstances through awareness, education,
          research, and access to appropriate support resources.
        </p>
      </header>

      {/* Counselling, Content, Intervention and Research */}
      <div className="ekam-work-sections">
        {initiatives.map((item, index) => (
          <InitiativeSection
            key={item.id}
            item={item}
            index={index}
          />
        ))}
      </div>

      {/* Closing CTA */}
      <section className="ekam-work-cta">
        <div className="ekam-work-cta-icon">
          <FiHeart />
        </div>

        <div className="ekam-work-cta-content">
          <span>JUSTICE • DIGNITY • EQUALITY</span>

          <h2>Working Towards a Fairer Society</h2>

          <p>
            Learn more about our initiatives and the values that
            guide our work towards a more equitable society.
          </p>
        </div>

        <NavLink className="ekam-work-cta-link" to="/about">
          About Us <FiArrowUpRight />
        </NavLink>
      </section>

      <Footer />
    </main>
  );
}
