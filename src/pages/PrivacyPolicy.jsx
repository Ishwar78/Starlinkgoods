import React from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiLock,
  FiUser,
  FiDatabase,
  FiMail,
  FiArrowLeft,
} from "react-icons/fi";
import "./PrivacyPolicy.css";
import Footer from "../components/Footer";

const privacySections = [
  {
    id: "information",
    icon: FiUser,
    title: "1. Information We Collect",
    content: [
      "When you use our website, we may collect information that you provide directly, such as your name, email address, phone number, billing address, shipping address and account details.",
      "We may also collect order information, product preferences, customer support messages and other information necessary to provide our services.",
    ],
  },
  {
    id: "usage",
    icon: FiDatabase,
    title: "2. How We Use Your Information",
    content: [
      "We use your information to process and deliver orders, manage your account, provide customer support and communicate important updates about your purchases.",
      "Where permitted, we may also use information to improve our website, understand customer preferences, prevent fraud and maintain website security.",
    ],
  },
  {
    id: "payments",
    icon: FiLock,
    title: "3. Payments and Security",
    content: [
      "Payments may be processed by third-party payment service providers. Payment information is handled according to the applicable provider's policies and security practices.",
      "We take reasonable measures to protect personal information. However, no method of electronic storage or internet transmission can be guaranteed to be completely secure.",
    ],
  },
  {
    id: "cookies",
    icon: FiDatabase,
    title: "4. Cookies and Similar Technologies",
    content: [
      "Our website may use cookies and similar technologies to maintain sessions, remember preferences, support shopping cart functionality and understand website usage.",
      "You can manage cookies through your browser settings. Disabling certain cookies may affect some website features.",
    ],
  },
  {
    id: "sharing",
    icon: FiShield,
    title: "5. Sharing of Information",
    content: [
      "We may share relevant information with service providers that help us operate our website, process payments, deliver orders, provide customer support or maintain security.",
      "Information may also be disclosed when required by applicable law or when reasonably necessary to protect our legal rights and prevent fraud.",
      "We do not treat the sale of personal information as a necessary part of our business operations.",
    ],
  },
  {
    id: "retention",
    icon: FiDatabase,
    title: "6. Data Retention",
    content: [
      "We retain personal information for as long as reasonably necessary for the purposes described in this policy, including order fulfilment, customer service, legal compliance and dispute resolution.",
      "Retention periods may vary depending on the type of information and applicable legal requirements.",
    ],
  },
  {
    id: "rights",
    icon: FiUser,
    title: "7. Your Privacy Rights",
    content: [
      "Depending on applicable law, you may be entitled to request access to, correction of or deletion of certain personal information, or to withdraw consent where processing is based on consent.",
      "To submit a privacy-related request, please contact us using the details provided below. We may need to verify your identity before responding.",
    ],
  },
  {
    id: "third-party",
    icon: FiShield,
    title: "8. Third-Party Websites",
    content: [
      "Our website may contain links to third-party websites or services. Their privacy practices are governed by their own policies.",
      "We encourage you to review the privacy policies of external services before sharing personal information with them.",
    ],
  },
  {
    id: "children",
    icon: FiUser,
    title: "9. Children's Privacy",
    content: [
      "Our website is not intended to knowingly collect personal information from children in circumstances where parental consent or other safeguards are required by applicable law.",
      "If you believe that a child has provided personal information inappropriately, please contact us so that we can review the matter.",
    ],
  },
  {
    id: "changes",
    icon: FiShield,
    title: "10. Changes to This Policy",
    content: [
      "We may update this Privacy Policy when our practices, services or legal requirements change. The updated version will be published on this page with a revised effective date where appropriate.",
      "Please review this page periodically to stay informed about our privacy practices.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
<>


    <main className="legal-page privacy-page">
      <section className="legal-hero">
        <div className="legal-container">
          <div className="legal-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Privacy Policy</span>
          </div>

          <div className="legal-hero-content">
            <span className="legal-eyebrow">
              <FiShield /> YOUR PRIVACY MATTERS
            </span>

            <h1>
              Privacy <span>Policy</span>
            </h1>

            <p>
              Learn how we collect, use and protect your information
              when you visit and shop on our website.
            </p>

            <div className="legal-updated">
              <FiLock />
              <span>Effective date: 19 October 2026</span>
            </div>
          </div>

          <div className="legal-hero-decoration">
            <FiShield />
          </div>
        </div>
      </section>

      <section className="legal-body">
        <div className="legal-container">
          <div className="legal-intro">
            <div className="legal-intro-icon">
              <FiLock />
            </div>

            <div>
              <h2>Your trust is important to us.</h2>
              <p>
                This Privacy Policy explains how we handle personal
                information when you access our website, create an account,
                place an order or contact our team. By using our services,
                you acknowledge this policy, subject to applicable law.
              </p>
            </div>
          </div>

          <div className="legal-layout">
            <aside className="legal-toc">
              <h3>On This Page</h3>
              <nav aria-label="Privacy policy sections">
                {privacySections.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    {section.title}
                  </a>
                ))}
                <a href="#privacy-contact">Contact Us</a>
              </nav>
            </aside>

            <div className="legal-content">
              {privacySections.map((section) => {
                const SectionIcon = section.icon;

                return (
                  <article
                    className="legal-section"
                    id={section.id}
                    key={section.id}
                  >
                    <div className="legal-section-heading">
                      <span className="legal-section-icon">
                        <SectionIcon />
                      </span>
                      <h2>{section.title}</h2>
                    </div>

                    {section.content.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </article>
                );
              })}

              <article
                className="legal-section legal-contact"
                id="privacy-contact"
              >
                <div className="legal-section-heading">
                  <span className="legal-section-icon">
                    <FiMail />
                  </span>
                  <h2>11. Contact Us</h2>
                </div>

                <p>
                  If you have questions, concerns or requests relating to
                  this Privacy Policy, please contact our team.
                </p>

                <a
                  className="legal-contact-link"
                  href="mailto:YOUR_SUPPORT_EMAIL"
                >
                  <FiMail />
                  YOUR_SUPPORT_EMAIL
                </a>
              </article>

              <div className="legal-end-note">
                <FiShield />
                <p>
                  We are committed to handling your information responsibly
                  and transparently.
                </p>
              </div>
            </div>
          </div>

          <Link to="/" className="legal-back-link">
            <FiArrowLeft /> Back to Home
          </Link>
        </div>
      </section>
    </main>
   <Footer />
    </>
  );
}