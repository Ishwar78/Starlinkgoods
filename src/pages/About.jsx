
import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiShield,
  
  FiUsers,
  FiBookOpen,
  FiHeart,
  FiTarget,
  FiEye,
} from "react-icons/fi";

import "./About.css";
import Footer from "../components/Footer";

const pageLinks = [
  { label: "About Us", path: "/about" },
  { label: "What We Do", path: "/what-we-do" },
  { label: "Founder", path: "/founder" },
  { label: "Our Team", path: "/our-team" },
];

const aboutFeatures = [
  { icon: <FiShield />, label: "Justice" },
  { icon: <FiShield />, label: "Fairness" },
  { icon: <FiUsers />, label: "Equality" },
];

export default function About() {
  return (
    <main className="ekam-about-page">



      
{/* IMAGE-ONLY HERO BANNER */}
<section
  className="hs-image-hero"
  aria-label="Featured home furniture collection"
>
  <img
    className="hs-image-hero-img"
    src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=90"
    alt="Premium contemporary living room furniture"
    loading="lazy"
  />
</section>

      {/* Page navigation */}
      <nav className="ekam-page-tabs" aria-label="About section navigation">
        {pageLinks.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`ekam-page-tab ${
              item.label === "About Us" ? "is-active" : ""
            }`}
            aria-current={item.label === "About Us" ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* About Us */}
      <section className="ekam-about-intro" id="about-us">
        <div className="ekam-about-copy">
          <h1 className="ekam-section-heading">
            About <span>Star Link Goods</span>
          </h1>

          <p>
           Star Link Goods Foundation is a pioneering non-governmental
            organization dedicated to upholding justice, equality, and
            human rights. With a steadfast commitment to fairness, the
            foundation works to address pressing social issues and promote
            equal rights and dignity for every individual.
          </p>

          <p>
            Our work is guided by integrity, compassion, and inclusivity.
            We strive to provide a safe and supportive environment for
            individuals affected by false accusations, wrongful convictions,
            and other human rights violations, while advocating for access
            to legal assistance and emotional support.
          </p>

          <p>
            Through research, public awareness, educational initiatives,
            and advocacy, we aim to challenge harmful stereotypes and
            encourage meaningful social and legal reform. We believe that
            fairness and justice must be accessible to everyone.
          </p>

          <p>
            Star Link Goods Foundation is committed to promoting positive
            masculinity, raising awareness about mental well-being, and
            encouraging equal rights and responsibilities for all.
          </p>

          <p>
            Join us in working towards a more just and equitable society.
            Together, we can make a difference.
          </p>
{/* 
          <div className="ekam-about-feature-list">
            {aboutFeatures.map((feature) => (
              <div className="ekam-about-feature" key={feature.label}>
                <span className="ekam-about-feature-icon">
                  {feature.icon}
                </span>
                <span>{feature.label}</span>
              </div>
            ))}
          </div> */}
        </div>

        <div className="ekam-about-visual">
          <div className="ekam-about-image-ring">
            <img
              src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1000&q=85"
              alt="People standing together in support of equality and justice"
              loading="lazy"
            />
          </div>

          <div className="ekam-about-floating-icon ekam-icon-top">
            <FiShield />
          </div>

          <div className="ekam-about-floating-icon ekam-icon-left">
            <FiShield />
          </div>

          <div className="ekam-about-floating-icon ekam-icon-bottom">
            <FiUsers />
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="ekam-purpose-section ekam-vision-section">
        <div className="ekam-purpose-heading">
          <h2 className="ekam-section-heading">
            Our <span>Vision</span>
          </h2>
        </div>

        <div className="ekam-purpose-panel ekam-vision-panel">
          <div className="ekam-purpose-visual">
            <div className="ekam-purpose-image">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85"
                alt="Mountain landscape symbolizing hope and a better future"
                loading="lazy"
              />
              <div className="ekam-purpose-image-overlay" />
              <h3>Vision</h3>
            </div>
          </div>

          <div className="ekam-purpose-copy">
            <p>
              At Star Link Goods Foundation, our vision is to cultivate a
              society where every individual, regardless of gender,
              background, or socioeconomic status, enjoys equal rights,
              opportunities, and protection under the law. We envision
              a future where harmful stereotypes and biases are dismantled
              and legal systems are fair, impartial, and just.
            </p>

            <p>
              Our foundation believes that every human being deserves to
              be treated with dignity, compassion, and empathy. We strive
              to foster a culture where discrimination, harassment, and
              violence are challenged and individuals are held accountable
              for their actions. Human dignity guides every aspect of our
              work, from advocacy to community support.
            </p>

            <p>
              Central to our vision is the establishment of legal systems
              that uphold fairness, impartiality, and accessibility. We
              support efforts to address gender-based discrimination and
              promote equal treatment under the law, including fair
              proceedings, due process, and access to justice.
            </p>

            <p>
              We also recognize the importance of protecting the innocent
              and ensuring due process for all individuals involved in
              legal proceedings. We aspire to a society where justice,
              respect, and equality are available to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="ekam-purpose-section ekam-mission-section">
        <div className="ekam-purpose-heading">
          <h2 className="ekam-section-heading">
            Our <span>Mission</span>
          </h2>
        </div>

        <div className="ekam-purpose-panel ekam-mission-panel">
          <div className="ekam-purpose-copy">
            <p>
              At Star Link Goods Foundation, our mission is to build a just and
              equitable society by promoting gender equality and human
              rights. We focus on addressing injustices faced by men and
              their families, including false accusations, wrongful
              convictions, and societal stereotypes, while supporting
              broader human rights. We advocate for fair laws, due process,
              and protection for all.
            </p>

            <p>
              We aim to connect individuals and families with appropriate
              legal guidance, emotional support, and information about
              available resources. Our commitment includes raising
              awareness about gender injustice and human suffering through
              educational content, research, and public outreach.
            </p>

            <p>
              Recognizing the importance of mental health, we strive to
              increase awareness and support for men's mental well-being.
              We also promote equal parental rights, fair treatment in
              workplaces, and equal opportunities, while encouraging
              respectful dialogue on difficult social issues.
            </p>

            <p>
              Guided by integrity, compassion, and inclusivity, we seek
              to create a supportive environment where every individual
              can be heard. Through collaboration, awareness, and advocacy,
              we work towards lasting positive change.
            </p>

            <p>
              Join us in making a meaningful difference and building a
              society rooted in justice, dignity, and equality.
            </p>
          </div>

          <div className="ekam-purpose-visual">
            <div className="ekam-purpose-image">
              <img
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=85"
                alt="People coming together in support of a shared mission"
                loading="lazy"
              />
              <div className="ekam-purpose-image-overlay" />
              <h3>Mission</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section className="ekam-involvement">
        <div className="ekam-involvement-icon">
          <FiHeart />
        </div>

        <div className="ekam-involvement-copy">
          <span className="ekam-involvement-label">
            JUSTICE • DIGNITY • EQUALITY
          </span>
          <h2>Be Part of Positive Change</h2>
          <p>
            Explore our initiatives, learn about our work, and discover
            how collective action can help build a fairer society.
          </p>
        </div>

        <Link to="/what-we-do" className="ekam-involvement-button">
          What We Do <FiArrowUpRight />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
