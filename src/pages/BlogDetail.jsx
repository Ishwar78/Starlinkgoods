
import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiChevronRight,
} from "react-icons/fi";
import "./BlogDetail.css";

const blogs = [
  {
    slug: "when-a-justice-system-learns-to-tolerate-lies",
    category: "Blogs",
    date: "11th September 2026",
    title: "When a Justice System Learns to Tolerate Lies",
    image: "/blog2.avif",
    imageAlt: "Illustration of truth, fabrication and institutional trust",
    intro: [
      "What happens when a justice system becomes so accustomed to a problem that the explanations for not fixing it start reinforcing the problem itself?",
      "India's culture of lying on oath is usually discussed as a problem of witnesses, litigants, lawyers or police. But the deeper issue is institutional: what happens when deliberate dishonesty carries insufficiently predictable consequences, while every attempt to enforce accountability is dismissed as too burdensome, potentially weaponisable, or historically inevitable?",
      "This article examines that feedback loop: how tolerance can create incentives for further dishonesty, how unreliable evidence contributes to judicial delay, how institutional asymmetry affects public trust, and why the solution is not indiscriminate punishment but better evidence integrity, symmetrical accountability, independent investigation and institutional correction.",
      "The larger question is not simply whether Indians tell the truth in court.",
      "It is whether our institutions are designed to make truth reliable and deliberate deception irrational.",
      "Because when institutional failure becomes normalised, the damage doesn't stop at the courtroom. It eventually becomes a question of rule of law, public trust, economic confidence and the credibility of the nation itself.",
    ],
    sections: [
      {
        heading: "When a Justice System Learns to Tolerate Lies",
        paragraphs: [
          "The problem with India's culture of lying on oath is not simply that people lie. It is that the system can make lying appear manageable when the consequences are uncertain, delayed or inconsistently applied.",
          "A functioning justice system should be able to distinguish between an honest mistake, an immaterial error, a significant contradiction and a deliberate falsehood about a material fact.",
          "The answer is therefore not indiscriminate prosecution. It is targeted enforcement.",
        ],
      },
      {
        heading: "Distinguishing Errors from Deliberate Falsehoods",
        paragraphs: [
          "A sensible classification could be:",
        ],
        table: {
          headers: ["Category", "Description", "Proposed Response"],
          rows: [
            [
              "Innocent discrepancy",
              "A genuine memory or factual error.",
              "None.",
            ],
            [
              "Immaterial falsehood",
              "An incorrect fact that has no meaningful bearing on the case.",
              "None or judicial warning.",
            ],
            [
              "Material contradiction",
              "A significant inconsistency requiring examination.",
              "Judicial consideration and recording.",
            ],
            [
              "Deliberate material falsehood",
              "Evidence indicates that a person knowingly lied about a matter relevant to the proceedings.",
              "Perjury inquiry/proceedings.",
            ],
            [
              "Systemic fabrication",
              "Evidence suggests that police, officials, intermediaries or other institutional actors may have fabricated evidence.",
              "Independent investigation and appropriate disciplinary/criminal action.",
            ],
          ],
        },
      },
      {
        heading: "Accountability Must Be Evidence-Based",
        paragraphs: [
          "Accountability should follow a careful examination of the evidence, the relevance of the disputed statement and the circumstances in which it was made. A contradiction alone should not automatically be treated as proof of deliberate deception.",
          "The purpose of enforcement is to protect the integrity of proceedings, not to punish every inconsistency or discourage genuine witnesses from participating in the justice system.",
        ],
      },
      {
        heading: "Restoring Institutional Trust",
        paragraphs: [
          "Reliable evidence, transparent procedures, independent investigation and consistent standards of accountability are essential to public confidence.",
          "Institutions must be able to correct mistakes, investigate credible allegations of fabrication and explain their decisions through fair and reviewable processes.",
          "The objective is a justice system in which truthful participation is protected, deliberate deception is addressed fairly, and accountability does not depend on a person's institutional position.",
        ],
      },
    ],
  },
  {
    slug: "divorce-in-two-countries",
    category: "Blogs",
    date: "July 2026",
    title: "Divorce In Two Countries, What No One Tells You",
    image: "/blog.avif",
    imageAlt: "Divorce proceedings across two countries",
    intro: [
      "An NRI husband's account after years of dealing with divorce proceedings across countries.",
      "Read about the practical challenges, legal processes and difficult questions families may face when matrimonial proceedings involve more than one country.",
    ],
    sections: [
      {
        heading: "Understanding Cross-Border Divorce",
        paragraphs: [
          "When spouses live in different countries, questions about jurisdiction, applicable law, court proceedings and the recognition of foreign judgments may become important.",
          "The appropriate legal steps depend on the countries involved and the facts of the individual case. Anyone facing such a situation should seek qualified legal advice in the relevant jurisdictions.",
        ],
      },
    ],
  },
  {
    slug: "child-guardianship-policy",
    category: "Blogs",
    date: "March 2026",
    title:
      "Child Guardianship Policy For Schools In Cases Of Divorced And Separated Parents",
    image: "/blog1.avif",
    imageAlt: "Child guardianship policy for schools",
    intro: [
      "Child Custody Policy book. Download sample letter email to school — divorced and separated parents.",
      "Read about guardianship policies, school communication and related resources for families navigating separation.",
    ],
    sections: [
      {
        heading: "Communication Between Schools and Parents",
        paragraphs: [
          "Clear school procedures can help staff manage parent communications, authorised collection arrangements and relevant custody documentation.",
          "Schools should follow applicable law and valid court orders, safeguard children's information and handle sensitive family circumstances carefully.",
        ],
      },
    ],
  },
  {
    slug: "justice-rajesh-bindal",
    category: "Org Update",
    date: "September 2026",
    title:
      "Keynote Address: Justice Rajesh Bindal At Ekam Nyaay Dialogue Chandigarh 2026",
    image: "/blog.avif",
    imageAlt: "Justice Rajesh Bindal public event",
    intro: [
      "FALSELY ACCUSED MEN AND THEIR FAMILIES ARE VICTIMS OF PROCESS: JUSTICE RAJESH BINDAL AT EKAM NYAAY DIALOGUE CHANDIGARH.",
      "Keynote address by Justice Rajesh Bindal. Full text of speech and event details.",
    ],
    sections: [
      {
        heading: "Keynote Address",
        paragraphs: [
          "This update highlights the keynote address and the issues raised during the Ekam Nyaay Dialogue in Chandigarh.",
          "Add the verified full speech transcript and event photographs here to publish the complete address.",
        ],
      },
    ],
  },
  {
    slug: "community-awareness",
    category: "Org Update",
    date: "August 2026",
    title: "Community Awareness And Public Engagement Initiatives",
    image: "/blog1.avif",
    imageAlt: "Community awareness initiative",
    intro: [
      "Updates on awareness initiatives, community participation and ongoing efforts to encourage informed conversations and access to useful resources.",
    ],
    sections: [
      {
        heading: "Community Engagement",
        paragraphs: [
          "Community awareness initiatives can create opportunities for people to learn about relevant issues, exchange perspectives and find useful information.",
          "Add the verified programme details, dates, outcomes and photographs here as each initiative is published.",
        ],
      },
    ],
  },
];

const BlogDetail = () => {
  const { slug } = useParams();
  const blog = blogs.find((item) => item.slug === slug);

  if (!blog) {
    return (
      <main className="bd-page">
        <section className="bd-not-found">
          <span className="bd-kicker">BLOGS</span>
          <h1>Article not found</h1>
          <p>The article may have moved or the link may be incorrect.</p>
          <Link className="bd-button" to="/blog">
            <FiArrowLeft /> Back to Blogs
          </Link>
        </section>
      </main>
    );
  }

  const relatedBlogs = blogs
    .filter((item) => item.slug !== blog.slug)
    .slice(0, 4);

  return (
    <main className="bd-page">
      {/* Top banner */}
      <section className="bd-hero">
        <img
          src="/banner.png"
          alt="Justice and legal awareness"
          className="bd-hero-image"
        />
        <div className="bd-hero-overlay" />

        <div className="bd-hero-bottom">
          <div className="bd-hero-label">
            <span />
            {blog.category}
          </div>
        </div>
      </section>

      {/* Article + sidebar */}
      <div className="bd-layout">
        <article className="bd-article">
          <div className="bd-article-heading">
            <Link to="/blog" className="bd-back-link">
              <FiArrowLeft /> All Blogs
            </Link>

            <h1>{blog.title}</h1>

            <div className="bd-article-meta">
              <span>{blog.category}</span>
              <span className="bd-meta-dot" />
              <time>{blog.date}</time>
            </div>
          </div>

          <figure className="bd-featured-image">
            <img src={blog.image} alt={blog.imageAlt} />
          </figure>

          <div className="bd-article-body">
            <h2>Introduction</h2>

            {blog.intro.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            {blog.sections.map((section, index) => (
              <section
                className="bd-content-section"
                key={section.heading}
              >
                <h2>{section.heading}</h2>

                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}

                {section.table && (
                  <div className="bd-table-wrap">
                    <table className="bd-table">
                      <thead>
                        <tr>
                          {section.table.headers.map((heading) => (
                            <th key={heading}>{heading}</th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {section.table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            <div className="bd-article-footer">
              <span className="bd-footer-line" />
              <p>
                Thank you for reading. Explore more articles and updates
                from our community.
              </p>
              <Link to="/blog" className="bd-button">
                Explore All Blogs <FiArrowRight />
              </Link>
            </div>
          </div>
        </article>

        {/* Right sidebar */}
        <aside className="bd-sidebar">
          <h2>More In This Segment</h2>

          <div className="bd-related-list">
            {relatedBlogs.map((item) => (
              <article className="bd-related-card" key={item.slug}>
                <Link
                  to={`/blog/${item.slug}`}
                  className="bd-related-image"
                >
                  <img src={item.image} alt={item.imageAlt} loading="lazy" />
                </Link>

                <div className="bd-related-content">
                  <div className="bd-related-meta">
                    <span>{item.category}</span>
                    <time>{item.date}</time>
                  </div>

                  <h3>
                    <Link to={`/blog/${item.slug}`}>
                      {item.title}
                    </Link>
                  </h3>
                </div>
              </article>
            ))}
          </div>

          <Link to="/blog" className="bd-sidebar-all">
            View All Blogs <FiChevronRight />
          </Link>
        </aside>
      </div>
    </main>
  );
};

export default BlogDetail;
