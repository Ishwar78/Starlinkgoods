import React from "react";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiShoppingBag,
  FiCreditCard,
  FiTruck,
  FiRefreshCw,
  FiAlertCircle,
  FiUserCheck,
  FiMail,
  FiArrowLeft,
} from "react-icons/fi";
import "./TermsConditions.css";
import Footer from "../components/Footer";

const termsSections = [
  {
    id: "acceptance",
    icon: FiFileText,
    title: "1. Acceptance of Terms",
    paragraphs: [
      "These Terms & Conditions govern your access to and use of this website, including browsing products, creating an account and placing orders.",
      "By using this website, you agree to these terms and applicable laws. If you do not agree, please discontinue using the website.",
    ],
  },
  {
    id: "eligibility",
    icon: FiUserCheck,
    title: "2. Eligibility and Accounts",
    paragraphs: [
      "You must be legally capable of entering into a binding agreement under applicable law to place an order.",
      "You are responsible for providing accurate account information and keeping your login credentials confidential. Please notify us if you suspect unauthorised access to your account.",
    ],
  },
  {
    id: "products",
    icon: FiShoppingBag,
    title: "3. Products and Availability",
    paragraphs: [
      "We aim to display accurate product descriptions, images, specifications and prices. Actual colours and appearance may vary depending on screen settings, lighting or product variations.",
      "Products are subject to availability. We reserve the right to correct listing errors, update product information and discontinue products where permitted by law.",
      "If an order cannot be fulfilled because a product is unavailable or a material listing error has occurred, we will contact you regarding the next appropriate steps and any applicable refund.",
    ],
  },
  {
    id: "pricing",
    icon: FiCreditCard,
    title: "4. Pricing and Payments",
    paragraphs: [
      "Prices, applicable taxes, shipping charges and other fees will be displayed or communicated during the ordering process as applicable.",
      "Orders must be paid using the payment methods made available at checkout. Payments may be processed by third-party payment providers under their applicable terms.",
      "If a pricing or payment error is identified, we may contact you to resolve it before fulfilment. Any cancellation or refund will be handled in accordance with applicable law and the relevant store policies.",
    ],
  },
  {
    id: "orders",
    icon: FiShoppingBag,
    title: "5. Orders and Confirmation",
    paragraphs: [
      "After placing an order, you may receive an order acknowledgement by email, SMS or another available communication method. An acknowledgement does not necessarily guarantee final acceptance or product availability.",
      "We may decline or cancel an order for legitimate reasons, including stock unavailability, suspected fraud, payment issues or material listing errors, subject to applicable law.",
      "Where payment has already been collected for an order that is cancelled, any eligible refund will be processed according to the applicable refund policy.",
    ],
  },
  {
    id: "shipping",
    icon: FiTruck,
    title: "6. Shipping and Delivery",
    paragraphs: [
      "Delivery estimates, available shipping methods and applicable charges will be provided where available during checkout or order communication.",
      "Delivery times are estimates and may be affected by location, courier operations, weather, public holidays or other circumstances beyond our reasonable control.",
      "Please provide a complete and accurate shipping address and contact number. If delivery fails because of incorrect information or an unavailable recipient, additional arrangements or charges may apply where permitted by law.",
    ],
  },
  {
    id: "returns",
    icon: FiRefreshCw,
    title: "7. Returns, Exchanges and Refunds",
    paragraphs: [
      "Returns, exchanges, cancellations and refunds are subject to our applicable policies, product eligibility and consumer rights under applicable law.",
      "Please inspect products after delivery and contact our support team promptly if an item is damaged, defective, incorrect or otherwise eligible for a return.",
      "For details about eligibility, time limits, return shipping, cancellation and refund processing, please review the relevant policies published on our website or contact our support team.",
    ],
  },
  {
    id: "conduct",
    icon: FiUserCheck,
    title: "8. Acceptable Use",
    paragraphs: [
      "You agree not to misuse the website, attempt unauthorised access, interfere with its operation, submit fraudulent orders or use the website for unlawful activities.",
      "We may restrict access or suspend accounts where reasonably necessary to address security concerns, suspected fraud or violations of these terms, subject to applicable law.",
    ],
  },
  {
    id: "intellectual",
    icon: FiFileText,
    title: "9. Intellectual Property",
    paragraphs: [
      "Website content, including text, graphics, logos, design elements, photographs and other materials, may be protected by intellectual property laws.",
      "You may not copy, reproduce, distribute or commercially use protected website content without the necessary permission, except where permitted by law.",
    ],
  },
  {
    id: "liability",
    icon: FiAlertCircle,
    title: "10. Liability and Website Availability",
    paragraphs: [
      "We aim to keep the website accurate, secure and accessible, but uninterrupted availability cannot be guaranteed. Maintenance, technical problems or external factors may temporarily affect access.",
      "Nothing in these terms excludes or limits any liability, warranty or consumer right that cannot lawfully be excluded or limited under applicable law.",
      "To the extent permitted by law, we are not responsible for losses arising from circumstances beyond our reasonable control.",
    ],
  },
  {
    id: "changes",
    icon: FiFileText,
    title: "11. Changes to These Terms",
    paragraphs: [
      "We may update these terms to reflect changes to our website, services or legal requirements. The revised version will be published on this page.",
      "Changes will apply as permitted by applicable law. Orders already placed will be handled in accordance with the terms and policies applicable to those orders and any mandatory legal requirements.",
    ],
  },
  {
    id: "law",
    icon: FiAlertCircle,
    title: "12. Governing Law",
    paragraphs: [
      "These terms are subject to applicable laws. Any disputes will be handled by the competent courts or other forums in accordance with applicable law and mandatory consumer protections.",
    ],
  },
];

export default function TermsConditions() {
  return (
    <>
    <main className="terms-page">
      <section className="tc-hero">
        <div className="tc-container">
          <div className="tc-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Terms &amp; Conditions</span>
          </div>

          <div className="tc-hero-content">
            <span className="tc-eyebrow">
              <FiFileText />
              CLEAR TERMS. BETTER SHOPPING.
            </span>

            <h1>
              Terms &amp; <span>Conditions</span>
            </h1>

            <p>
              Please read the terms that apply when browsing our
              collections, creating an account and shopping with us.
            </p>

            <div className="tc-effective-date">
              <FiFileText />
              <span>Effective date: 19 October 2026</span>
            </div>
          </div>

          <div className="tc-hero-decoration">
            <FiFileText />
          </div>
        </div>
      </section>

      <section className="tc-body">
        <div className="tc-container">
          <div className="tc-intro">
            <div className="tc-intro-icon">
              <FiShoppingBag />
            </div>

            <div>
              <h2>Welcome to our store</h2>
              <p>
                These terms explain the main conditions for using our
                website and purchasing products. Please also review our
                Privacy Policy and applicable shipping, return and refund
                policies before placing an order.
              </p>

              <Link to="/privacy-policy" className="tc-privacy-link">
                Read our Privacy Policy
              </Link>
            </div>
          </div>

          <div className="tc-layout">
            <aside className="tc-toc">
              <h3>Terms Overview</h3>

              <nav aria-label="Terms and conditions sections">
                {termsSections.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    {section.title}
                  </a>
                ))}
                <a href="#tc-contact">Contact Us</a>
              </nav>
            </aside>

            <div className="tc-content">
              {termsSections.map((section) => {
                const SectionIcon = section.icon;

                return (
                  <article
                    className="tc-section"
                    id={section.id}
                    key={section.id}
                  >
                    <div className="tc-section-heading">
                      <span className="tc-section-icon">
                        <SectionIcon />
                      </span>
                      <h2>{section.title}</h2>
                    </div>

                    {section.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </article>
                );
              })}

              <article className="tc-section" id="tc-contact">
                <div className="tc-section-heading">
                  <span className="tc-section-icon">
                    <FiMail />
                  </span>
                  <h2>13. Contact Us</h2>
                </div>

                <p>
                  If you have questions about these Terms &amp; Conditions,
                  orders or store policies, please contact our support team.
                </p>

                <a
                  href="mailto:YOUR_SUPPORT_EMAIL"
                  className="tc-contact-link"
                >
                  <FiMail />
                  YOUR_SUPPORT_EMAIL
                </a>
              </article>

              <div className="tc-notice">
                <FiAlertCircle />
                <p>
                  These terms should be read together with the applicable
                  product, shipping, cancellation, return and refund policies.
                </p>
              </div>
            </div>
          </div>

          <Link to="/" className="tc-back-link">
            <FiArrowLeft />
            Back to Home
          </Link>
        </div>
      </section>
    </main>
   <Footer />
        </>
  );
}