
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowRight, FiArrowLeft, FiHeart } from "react-icons/fi";
import "./OurHeroes.css";
import Footer from "../components/Footer";
// Hero data: apni actual information aur images yahan update karna.
const heroesData = [
  {
    id: 1,
    slug: "deepika-narayan-bhardwaj",
    name: "Deepika Narayan Bhardwaj",
    role: "Filmmaker & Men's Rights Activist",
    image: "/heroes/hero-1.jpg",
    shortDescription:
      "An independent filmmaker and journalist known for documenting stories of people seeking justice and raising awareness about men's rights.",
    about:
      "Deepika Narayan Bhardwaj is known for her work in documentary filmmaking, journalism and social awareness. Her work highlights individual stories, legal challenges and the importance of a fair hearing.",
    achievements: [
      "Documentary filmmaking and storytelling",
      "Social awareness and advocacy",
      "Highlighting individual experiences with the justice system",
    ],
  },
  {
    id: 2,
    slug: "arnab-ganguly",
    name: "Arnab Ganguly",
    role: "A Story of Resilience",
    image: "/heroes/hero-2.jpg",
    shortDescription:
      "A story featured in the Ekam Nyaay community that highlights the personal challenges and resilience involved in seeking justice.",
    about:
      "This profile shares a personal journey and the challenges associated with navigating the legal system. Add the verified biography, timeline and relevant case information here.",
    achievements: [
      "Personal journey and resilience",
      "Awareness of legal challenges",
      "Lessons from the journey",
    ],
  },
  {
    id: 3,
    slug: "prakash-swamy",
    name: "Prakash Swamy",
    role: "Justice & Awareness",
    image: "/heroes/hero-3.jpg",
    shortDescription:
      "A featured story focusing on the importance of due process, perseverance and awareness of legal rights.",
    about:
      "Use this section to present Prakash Swamy's verified background, his experience and the events relevant to his story.",
    achievements: [
      "Personal story",
      "Legal awareness",
      "Community impact",
    ],
  },
  {
    id: 4,
    slug: "savita-arya",
    name: "Savita Arya",
    role: "Social Awareness",
    image: "/heroes/hero-4.jpg",
    shortDescription:
      "A featured voice in conversations about family matters, social awareness and equal rights.",
    about:
      "Add Savita Arya's verified biography and the details of her contribution to public awareness and the issues she discusses.",
    achievements: [
      "Social awareness",
      "Public conversations",
      "Community engagement",
    ],
  },
  {
    id: 5,
    slug: "sahil-mongia",
    name: "Sahil Mongia",
    role: "Legal Awareness",
    image: "/heroes/hero-5.jpg",
    shortDescription:
      "A legal professional featured in discussions about legal rights, due process and access to justice.",
    about:
      "Add the verified professional profile, experience, areas of practice and relevant contributions for this hero.",
    achievements: [
      "Legal education",
      "Public awareness",
      "Rights and due process",
    ],
  },
  {
    id: 6,
    slug: "mahesh-r-v",
    name: "Mahesh R V",
    role: "A Journey Towards Justice",
    image: "/heroes/hero-6.jpg",
    shortDescription:
      "A personal story about perseverance, family matters and the experience of navigating legal proceedings.",
    about:
      "Add the complete verified story, important milestones and other relevant information for this profile.",
    achievements: [
      "Personal journey",
      "Awareness and advocacy",
      "Lessons learned",
    ],
  },
  {
    id: 7,
    slug: "amit-kukreja",
    name: "Amit Kukreja",
    role: "Financial Awareness",
    image: "/heroes/hero-7.jpg",
    shortDescription:
      "A featured expert discussing financial planning, communication and informed decision-making in relationships.",
    about:
      "Add verified professional details, qualifications, experience and the contribution associated with this profile.",
    achievements: [
      "Financial education",
      "Planning and awareness",
      "Public discussions",
    ],
  },
  {
    id: 8,
    slug: "yuvraj",
    name: "Yuvraj",
    role: "Awareness & Advocacy",
    image: "/heroes/hero-8.jpg",
    shortDescription:
      "A featured story highlighting the importance of awareness, support and informed action when facing difficult circumstances.",
    about:
      "Add Yuvraj's verified background, personal journey and the details you want visitors to learn about.",
    achievements: [
      "Community awareness",
      "Personal journey",
      "Sharing experiences",
    ],
  },
  {
    id: 9,
    slug: "hero-nine",
    name: "Our Next Hero",
    role: "Community Advocate",
    image: "/heroes/hero-9.jpg",
    shortDescription:
      "A new story of determination, awareness and the pursuit of equal rights.",
    about: "Add the verified biography and full story for this hero.",
    achievements: ["Community contribution", "Awareness", "Advocacy"],
  },
  {
    id: 10,
    slug: "hero-ten",
    name: "Our Next Story",
    role: "A Story of Courage",
    image: "/heroes/hero-10.jpg",
    shortDescription:
      "Discover another story of courage, perseverance and the importance of equal treatment.",
    about: "Add the verified biography and full story for this hero.",
    achievements: ["Personal journey", "Awareness", "Community impact"],
  },
  {
    id: 11,
    slug: "hero-eleven",
    name: "A Voice for Justice",
    role: "Justice & Equality",
    image: "/heroes/hero-11.jpg",
    shortDescription:
      "A story that encourages awareness, fairness and meaningful conversations about justice.",
    about: "Add the verified biography and full story for this hero.",
    achievements: ["Justice awareness", "Advocacy", "Community support"],
  },
  {
    id: 12,
    slug: "hero-twelve",
    name: "A Journey of Hope",
    role: "Inspiring Stories",
    image: "/heroes/hero-12.jpg",
    shortDescription:
      "A story about moving forward through challenges and sharing experiences that can help others.",
    about: "Add the verified biography and full story for this hero.",
    achievements: ["Resilience", "Awareness", "Inspiration"],
  },
  {
    id: 13,
    slug: "hero-thirteen",
    name: "Champion of Change",
    role: "Social Impact",
    image: "/heroes/hero-13.jpg",
    shortDescription:
      "A profile highlighting a commitment to awareness, community support and positive change.",
    about: "Add the verified biography and full story for this hero.",
    achievements: ["Social impact", "Community work", "Awareness"],
  },
  {
    id: 14,
    slug: "hero-fourteen",
    name: "A Voice That Matters",
    role: "Equal Rights",
    image: "/heroes/hero-14.jpg",
    shortDescription:
      "A story focused on the importance of being heard and treated fairly.",
    about: "Add the verified biography and full story for this hero.",
    achievements: ["Equal rights", "Awareness", "Community engagement"],
  },
  {
    id: 15,
    slug: "hero-fifteen",
    name: "Strength & Determination",
    role: "Personal Stories",
    image: "/heroes/hero-15.jpg",
    shortDescription:
      "A personal journey illustrating the importance of determination and support.",
    about: "Add the verified biography and full story for this hero.",
    achievements: ["Determination", "Personal journey", "Awareness"],
  },
  {
    id: 16,
    slug: "hero-sixteen",
    name: "A Story of Resilience",
    role: "Community Inspiration",
    image: "/heroes/hero-16.jpg",
    shortDescription:
      "An inspiring profile about perseverance and the value of sharing experiences.",
    about: "Add the verified biography and full story for this hero.",
    achievements: ["Resilience", "Community inspiration", "Awareness"],
  },
];

function OurHeroesListing() {
  const [visibleCount, setVisibleCount] = useState(8);

  const visibleHeroes = heroesData.slice(0, visibleCount);
  const hasMore = visibleCount < heroesData.length;

  return (
    <>
    <main className="heroes-page">
      {/* Hero banner */}
      <section className="heroes-banner">
        <div className="heroes-banner-grid" />
        <div className="heroes-banner-inner">
          <span className="heroes-eyebrow">INSPIRING STORIES</span>
          <h1>Our Heroes</h1>
          <p>
            Real people. Powerful stories. A journey towards awareness,
            dignity and equal justice.
          </p>
        </div>
        <div className="heroes-banner-decoration" aria-hidden="true">
          <FiHeart />
        </div>
      </section>

      {/* Introduction */}
      <section className="heroes-intro">
        <div className="heroes-intro-label">
          <span />
          STORIES THAT MATTER
        </div>
        <h2>Meet the People Behind the Stories</h2>
        <p>
          Discover the journeys, experiences and contributions of individuals
          whose stories encourage meaningful conversations about justice
          and equality.
        </p>
      </section>

      {/* Alternating hero profiles */}
      <section className="heroes-list" aria-label="Our heroes">
        {visibleHeroes.map((hero, index) => (
          <article
            className={`hero-profile-card ${
              index % 2 !== 0 ? "hero-profile-reverse" : ""
            }`}
            key={hero.id}
          >
            <Link
              to={`/our-heroes/${hero.slug}`}
              className="hero-profile-image-link"
              aria-label={`View ${hero.name}'s profile`}
            >
              <div className="hero-profile-image-wrap">
                <img
                  src={hero.image}
                  alt={hero.name}
                  className="hero-profile-image"
                  loading={index < 2 ? "eager" : "lazy"}
                />
                <span className="hero-image-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </Link>

            <div className="hero-profile-content">
              <span className="hero-profile-label">{hero.role}</span>
              <h3>{hero.name}</h3>
              <p>{hero.shortDescription}</p>

              <Link
                to={`/our-heroes/${hero.slug}`}
                className="hero-profile-button"
              >
                VIEW PROFILE <FiArrowRight />
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Load more */}
      <div className="heroes-load-more">
        {hasMore ? (
          <button
            type="button"
            className="heroes-load-button"
            onClick={() =>
              setVisibleCount((current) =>
                Math.min(current + 8, heroesData.length)
              )
            }
          >
            LOAD MORE <FiArrowRight />
          </button>
        ) : (
          <p className="heroes-end-message">
            You have reached the end of our stories.
          </p>
        )}
        <span className="heroes-count">
          SHOWING {visibleHeroes.length} OF {heroesData.length} STORIES
        </span>
      </div>

      {/* Contribution banner */}
      <section className="heroes-cta">
        <div className="heroes-cta-content">
          <span>STAND FOR EQUAL RIGHTS</span>
          <h2>Every Story Deserves to Be Heard.</h2>
          <p>
            Help us spread awareness and support a fairer, more understanding
            society.
          </p>
          <Link to="/contact" className="heroes-cta-button">
            GET IN TOUCH <FiArrowRight />
          </Link>
        </div>
        <div className="heroes-cta-icon">
          <FiHeart />
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}

function HeroDetail() {
  const { slug } = useParams();
  const hero = heroesData.find((item) => item.slug === slug);

  if (!hero) {
    return (

      <main className="hero-detail-not-found">
        <h1>Hero Not Found</h1>
        <p>This profile may have been moved or does not exist.</p>
        <Link to="/our-heroes" className="hero-profile-button">
          <FiArrowLeft /> BACK TO OUR HEROES
        </Link>
      </main>
    );
  }

  return (
<>
    <main className="hero-detail-page">
      <div className="hero-detail-top">
        <Link to="/our-heroes" className="hero-detail-back">
          <FiArrowLeft /> BACK TO OUR HEROES
        </Link>
      </div>

      <section className="hero-detail-card">
        <div className="hero-detail-image-wrap">
          <img src={hero.image} alt={hero.name} />
        </div>

        <div className="hero-detail-content">
          <span className="hero-profile-label">{hero.role}</span>
          <h1>{hero.name}</h1>
          <p className="hero-detail-lead">{hero.shortDescription}</p>
          <div className="hero-detail-divider" />

          <h2>About {hero.name}</h2>
          <p>{hero.about}</p>

          <h2>Highlights</h2>
          <ul className="hero-achievements">
            {hero.achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>

          <Link to="/our-heroes" className="hero-profile-button">
            <FiArrowLeft /> EXPLORE ALL HEROES
          </Link>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}

// Use the same component for both listing and individual profiles.
export default function OurHeroes() {
  const { slug } = useParams();

  return slug ? <HeroDetail /> : <OurHeroesListing />;
}
