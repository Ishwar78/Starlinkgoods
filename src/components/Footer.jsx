
import React, { useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
  FaXTwitter,
  FaTelegram,
  FaWhatsapp,
} from "react-icons/fa6";

import {
  FiArrowUpRight,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

import "./Footer.css";

const exploreLinks = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Contact Us", "/contact"],
  ["Customer Login", "/order-user/login"],
  ["Member Register", "/member-register"],
];

const categoryLinks = [
  ["Sofas", "#categories"],
  ["Beds", "#categories"],
  ["Dining Sets", "#categories"],
  ["Mattresses", "#categories"],
  ["Chairs", "#categories"],
  ["Storage & Decor", "#categories"],
];

const supportLinks = [
  ["My Account", "#account"],
  ["Wishlist", "#wishlist"],
  ["Shopping Cart", "#cart"],
  ["Shipping & Delivery", "#shipping"],
  ["Returns & Refunds", "#returns"],
  ["Privacy Policy", "/privacy-policy"],
];

const socialLinks = [
  {
    label: "Instagram",
    url: "https://www.instagram.com/",
    icon: <FaInstagram />,
  },
  {
    label: "Facebook",
    url: "https://www.facebook.com/",
    icon: <FaFacebookF />,
  },
  {
    label: "Pinterest",
    url: "https://www.pinterest.com/",
    icon: <FaPinterestP />,
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/",
    icon: <FaYoutube />,
  },
  {
    label: "X",
    url: "https://x.com/",
    icon: <FaXTwitter />,
  },
];

/*
 * Replace these placeholder URLs with your actual
 * Telegram group and WhatsApp community invite links.
 */
const communityLinks = {
  telegram: "https://t.me/YOUR_TELEGRAM_GROUP",
  whatsapp: "https://chat.whatsapp.com/YOUR_WHATSAPP_INVITE",
};

function LinkColumn({ title, links }) {
  return (
    <div className="slg-footer-column">
      <h3>{title}</h3>

      <ul>
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href}>
              <span>{label}</span>
              <FiArrowUpRight className="slg-link-arrow" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();

    // Connect your newsletter API here to save subscribers.
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="slg-footer" id="footer">
      <div className="slg-footer-accent" />

      {/* COMMUNITY JOIN BAR */}
      <section
        className="slg-community-bar"
        aria-label="Join our community"
      >
        <a href="/" className="slg-community-logo">
          <img
            src="/Logo-1.png"
            alt="Star Link Goods"
          />
        </a>

        <div className="slg-community-content">
          <p>
            Become Part of Our Community:
            <span>Join Today</span>
          </p>

          <div className="slg-community-actions">
            <a
              href={communityLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="slg-community-button"
              aria-label="Join our Telegram community"
            >
              <FaTelegram className="slg-community-icon" />
              <span>JOIN US</span>
            </a>

            <a
              href={communityLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="slg-community-button"
              aria-label="Join our WhatsApp community"
            >
              <FaWhatsapp className="slg-community-icon" />
              <span>JOIN US</span>
            </a>
          </div>
        </div>
      </section>

      {/* MAIN FOOTER */}
      <div className="slg-footer-main">
        <div className="slg-footer-brand">
          <a href="/" className="slg-footer-logo">
            <img
              src="/Logo-1.png"
              alt="SLG - Star Link Goods"
            />
          </a>

          <p className="slg-footer-description">
            Thoughtfully selected furniture for the way you live.
            Discover timeless designs, everyday comfort and beautiful
            pieces that make your house feel like home.
          </p>

          <h4 className="slg-social-title">
            FOLLOW OUR JOURNEY
          </h4>

          <div className="slg-social-links">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>

          <div className="slg-brand-promise">
            <FiCheckCircle />
            <span>
              Style, comfort & quality for every home.
            </span>
          </div>
        </div>

        <LinkColumn
          title="Explore"
          links={exploreLinks}
        />

        <LinkColumn
          title="Shop Categories"
          links={categoryLinks}
        />

        <LinkColumn
          title="Customer Care"
          links={supportLinks}
        />

        {/* CONTACT */}
        <div className="slg-footer-column slg-contact-column">
          <h3>Get In Touch</h3>

          <p className="slg-contact-intro">
            Need help choosing furniture? Our team is here to help.
          </p>

          <a className="slg-contact-item" href="#contact">
            <span className="slg-contact-icon">
              <FiMapPin />
            </span>
            <span>
              <small>Our Location</small>
              <strong>View store location</strong>
            </span>
          </a>

          <a className="slg-contact-item" href="#contact">
            <span className="slg-contact-icon">
              <FiPhone />
            </span>
            <span>
              <small>Call Us</small>
              <strong>Contact our team</strong>
            </span>
          </a>

          <a className="slg-contact-item" href="#contact">
            <span className="slg-contact-icon">
              <FiMail />
            </span>
            <span>
              <small>Email Support</small>
              <strong>Send us a message</strong>
            </span>
          </a>

          <div className="slg-contact-item">
            <span className="slg-contact-icon">
              <FiClock />
            </span>
            <span>
              <small>Support Hours</small>
              <strong>Check our availability</strong>
            </span>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="slg-footer-bottom">
        <p>
          © {new Date().getFullYear()}{" "}
          <strong>Star Link Goods</strong>. All rights reserved.
        </p>

        <div className="slg-legal-links">
          <a href="/privacy-policy">Privacy Policy</a>
          <span>|</span>
          <a href="/terms-conditions">
            Terms & Conditions
          </a>
        </div>

        <a className="slg-back-top" href="#home">
          Back to top <FiArrowUpRight />
        </a>
      </div>
    </footer>
  );
}
