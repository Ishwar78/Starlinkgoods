
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiHeart,
  FiRefreshCw,
  FiChevronRight,
} from "react-icons/fi";
import "./Judgments.css";
import Footer from "../components/Footer";
const judgments = [
  {
    id: 1,
    title: "Undertaking To Perform",
    category: "Supreme Court",
    date: "Oct 7, 2026",
    image: "/images/judgment-1.jpg",
    description:
      "A detailed judgment discussing the legal principles and the importance of voluntary agreements.",
    slug: "undertaking-to-perform",
  },
  {
    id: 2,
    title: "Monetary Settlements In Matrimonial Disputes",
    category: "Supreme Court",
    date: "Oct 6, 2026",
    image: "/images/judgment-2.jpg",
    description:
      "The court examined monetary settlements and the legal principles applicable to matrimonial disputes.",
    slug: "monetary-settlements",
  },
  {
    id: 3,
    title:
      "Supreme Court Lays Down Safeguards to Prevent Misuse of POCSO",
    category: "Supreme Court",
    date: "Sep 26, 2026",
    image: "/images/judgment-3.jpg",
    description:
      "An overview of judicial safeguards and legal considerations in child custody matters.",
    slug: "pocso-safeguards",
  },
  {
    id: 4,
    title: "Fathers Are an Indivisible Part of Family Life",
    category: "High Court",
    date: "Sep 22, 2026",
    image: "/images/judgment-4.jpg",
    description:
      "The court discussed parental responsibilities and the welfare of children in custody matters.",
    slug: "fathers-family-life",
  },
  {
    id: 5,
    title: "Mere Refusal to Marry Cannot Amount to Deceit",
    category: "Supreme Court",
    date: "Sep 18, 2026",
    image: "/images/judgment-5.jpg",
    description:
      "A discussion of the legal principles concerning relationships and allegations of deceit.",
    slug: "refusal-to-marry",
  },
  {
    id: 6,
    title: "Need for a National Level Portal to Track False Cases",
    category: "High Court",
    date: "Sep 14, 2026",
    image: "/images/judgment-6.jpg",
    description:
      "The judgment highlights concerns surrounding case records and judicial processes.",
    slug: "national-level-portal",
  },
  {
    id: 7,
    title: "Alibi Can Be Considered at the Quashing Stage",
    category: "Supreme Court",
    date: "Sep 10, 2026",
    image: "/images/judgment-7.jpg",
    description:
      "A legal discussion on evidence, criminal proceedings and consideration of an alibi.",
    slug: "alibi-quashing-stage",
  },
  {
    id: 8,
    title: "Party Cannot Unilaterally Withdraw Consent",
    category: "Other Court",
    date: "Sep 5, 2026",
    image: "/images/judgment-8.jpg",
    description:
      "The court considered consent, settlement terms and the legal effect of agreements.",
    slug: "withdraw-consent",
  },
  {
    id: 9,
    title: "Written Agreement of Live-In Relationship",
    category: "High Court",
    date: "Oct 23, 2026",
    image: "/images/judgment-9.jpg",
    description:
      "An overview of a High Court decision concerning written agreements and relationships.",
    slug: "written-agreement-live-in",
  },
  {
    id: 10,
    title: "Father Cannot Be Denied Visitation Rights",
    category: "High Court",
    date: "Oct 21, 2026",
    image: "/images/judgment-10.jpg",
    description:
      "A decision concerning parental visitation and the welfare of a child.",
    slug: "father-visitation-rights",
  },
  {
    id: 11,
    title: "Mere Registration of an FIR May Be Found False",
    category: "High Court",
    date: "Oct 8, 2026",
    image: "/images/judgment-11.jpg",
    description:
      "A legal overview concerning FIR registration and the evaluation of evidence.",
    slug: "registration-of-fir",
  },
  {
    id: 12,
    title: "Judicial Safeguards and Fair Legal Proceedings",
    category: "Other Court",
    date: "Sep 2, 2026",
    image: "/images/judgment-12.jpg",
    description:
      "An overview of safeguards intended to support fair and balanced legal proceedings.",
    slug: "judicial-safeguards",
  },
];

const featuredJudgments = [
  {
    id: "featured-1",
    title:
      "Written Agreement of Live-In Relationship & Voluntary Separation",
    category: "High Court",
    date: "Oct 23, 2026",
    image: "/images/judgment-featured-1.jpg",
    description:
      "Read the featured judgment and explore the legal observations discussed by the court.",
    slug: "written-agreement-live-in",
  },
  {
    id: "featured-2",
    title: "Karnataka HC: Father Cannot Be Denied Visitation Rights",
    category: "High Court",
    date: "Oct 21, 2026",
    image: "/images/judgment-featured-2.jpg",
    description:
      "An overview of visitation rights and considerations relating to child welfare.",
    slug: "father-visitation-rights",
  },
  {
    id: "featured-3",
    title: "Mere Registration of an FIR Which Eventually May Be Found False",
    category: "High Court",
    date: "Oct 8, 2026",
    image: "/images/judgment-featured-3.jpg",
    description:
      "Explore the judicial observations on FIRs and criminal proceedings.",
    slug: "registration-of-fir",
  },
];

const filters = [
  "All",
  "High Court",
  "Other Court",
  "Supreme Court",
];

function JudgmentMeta({ category, date }) {
  return (
    <div className="judgment-meta">
      <span>
        <i />
        {category}
      </span>
      <span>
        <i />
        {date}
      </span>
    </div>
  );
}

function FeaturedCard({ item, variant = "" }) {
  return (
    <article className={`judgment-featured-card ${variant}`}>
      <img
        src={item.image}
        alt={item.title}
        className="judgment-featured-image"
        loading="lazy"
      />

      <div className="judgment-featured-overlay">
        <JudgmentMeta category={item.category} date={item.date} />

        <h2>{item.title}</h2>

        {variant === "judgment-featured-main" && (
          <>
            <p>{item.description}</p>
            <Link
              to={`/judgments/${item.slug}`}
              className="judgment-read-more-outline"
            >
              READ MORE <FiChevronRight />
              <FiChevronRight />
            </Link>
          </>
        )}

        {variant !== "judgment-featured-main" && (
          <Link
            to={`/judgments/${item.slug}`}
            className="judgment-featured-link"
            aria-label={`Read ${item.title}`}
          >
            <FiArrowRight />
          </Link>
        )}
      </div>
    </article>
  );
}

function JudgmentCard({ item }) {
  return (
    <article className="judgment-card">
      <Link
        to={`/judgments/${item.slug}`}
        className="judgment-card-image-link"
        aria-label={`Read ${item.title}`}
      >
        <img
          src={item.image}
          alt={item.title}
          className="judgment-card-image"
          loading="lazy"
        />
      </Link>

      <div className="judgment-card-content">
        <JudgmentMeta category={item.category} date={item.date} />

        <h3>
          <Link to={`/judgments/${item.slug}`}>
            {item.title}
          </Link>
        </h3>

        <p>{item.description}</p>

        <Link
          to={`/judgments/${item.slug}`}
          className="judgment-read-more-button"
        >
          READ MORE <FiChevronRight />
          <FiChevronRight />
        </Link>
      </div>
    </article>
  );
}

export default function Judgments() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(8);

  const filteredJudgments = useMemo(() => {
    if (activeFilter === "All") {
      return judgments;
    }

    return judgments.filter(
      (item) => item.category === activeFilter
    );
  }, [activeFilter]);

  const visibleJudgments = filteredJudgments.slice(0, visibleCount);

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    setVisibleCount(8);
  };

  return (
    <>
    <main className="judgments-page">
      {/* Hero banner */}
      <section className="judgments-hero">
        <div className="judgments-hero-overlay" />

        <div className="judgments-hero-title">
          <h1>Judgments</h1>
        </div>
      </section>

      {/* Featured judgments */}
      <section className="judgments-container judgments-featured-section">
        <div className="judgments-featured-grid">
          <FeaturedCard
            item={featuredJudgments[0]}
            variant="judgment-featured-main"
          />

          <div className="judgments-featured-side">
            <FeaturedCard
              item={featuredJudgments[1]}
              variant="judgment-featured-small"
            />

            <FeaturedCard
              item={featuredJudgments[2]}
              variant="judgment-featured-small"
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="judgments-toolbar">
          <div className="judgments-filter-buttons">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter}
                onClick={() => handleFilter(filter)}
                className={`judgments-filter-button ${
                  activeFilter === filter ? "active" : ""
                }`}
                aria-pressed={activeFilter === filter}
              >
                {filter}
              </button>
            ))}
          </div>

          <label className="judgments-select-filter">
            <span>Filter</span>
            <select
              value={activeFilter}
              onChange={(event) => handleFilter(event.target.value)}
              aria-label="Filter judgments by court"
            >
              {filters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Judgment cards */}
        <div className="judgments-cards-grid">
          {visibleJudgments.map((item) => (
            <JudgmentCard key={item.id} item={item} />
          ))}
        </div>

        {visibleJudgments.length === 0 && (
          <div className="judgments-empty">
            <h3>No judgments found</h3>
            <p>Please select another court category.</p>
          </div>
        )}

        {visibleCount < filteredJudgments.length && (
          <div className="judgments-load-more-wrap">
            <button
              type="button"
              className="judgments-load-more"
              onClick={() =>
                setVisibleCount((count) => count + 8)
              }
            >
              LOAD MORE <FiRefreshCw />
            </button>
          </div>
        )}
      </section>

      {/* Donation banner */}
      <section className="judgments-donation-section">
        <div className="judgments-donation-banner">
          <div className="judgments-donation-content">
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

            <Link
              to="/donate"
              className="judgments-donation-button"
            >
              <FiHeart />
              Yes! I Want to help
            </Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
