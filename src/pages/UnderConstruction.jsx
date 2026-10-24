
import React from "react";
import {
  FiMail,
  FiSun,
  FiZap,
  FiCheckCircle,
  FiArrowRight,
  FiTool,
} from "react-icons/fi";
import "./UnderConstruction.css";

export default function UnderConstruction() {
  return (
    <main className="uc-page">
      {/* Decorative background */}
      <div className="uc-sky" aria-hidden="true">
        <span className="uc-cloud uc-cloud-one" />
        <span className="uc-cloud uc-cloud-two" />
        <span className="uc-sun-glow" />
      </div>

      {/* Left side: building and solar panels */}
      <div className="uc-building" aria-hidden="true">
        <div className="uc-building-roof" />
        <div className="uc-building-grid">
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <div className="uc-building-base" />
      </div>

      <div className="uc-solar-field" aria-hidden="true">
        {Array.from({ length: 3 }, (_, i) => (
          <div className="uc-solar-panel" key={i}>
            {Array.from({ length: 8 }, (_, j) => (
              <span key={j} />
            ))}
          </div>
        ))}
      </div>

      {/* Right side: industrial structure */}
      <div className="uc-industrial-roof" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* Main content */}
      <section className="uc-content">
        <div className="uc-brand">
          <div className="uc-brand-symbol">
            <span className="uc-brand-s">S</span>
            <span className="uc-brand-l">L</span>
            <span className="uc-brand-g">G</span>
            <span className="uc-brand-orbit" />
            <span className="uc-brand-star">✦</span>
          </div>

          <div className="uc-brand-name">STAR LINK GOODS</div>

          <div className="uc-tagline">
            <span />
            WE BUILD FUTURE
            <span />
          </div>
        </div>

        <div className="uc-main-sign">
          <div className="uc-gear" aria-hidden="true">
            <FiTool />
          </div>

          <div className="uc-hardhat" aria-hidden="true">
            <div className="uc-hardhat-top" />
            <div className="uc-hardhat-body" />
            <div className="uc-hardhat-brim" />
          </div>

          <div className="uc-website-sign">WEBSITE</div>

          <div className="uc-yellow-sign">
            <span>UNDER CONSTRUCTION</span>
          </div>

          <div className="uc-stripes" />
        </div>

        <p className="uc-message">
          We are working hard to bring you
          <br className="uc-desktop-break" /> a better experience.
        </p>

        <div className="uc-benefits">
          <div className="uc-benefit">
            <span className="uc-benefit-icon uc-green">
              <FiCheckCircle />
            </span>
            <strong>Clean</strong>
            <span>Energy</span>
          </div>

          <div className="uc-benefit-divider" />

          <div className="uc-benefit">
            <span className="uc-benefit-icon uc-orange">
              <FiSun />
            </span>
            <strong>Sustainable</strong>
            <span>Future</span>
          </div>

          <div className="uc-benefit-divider" />

          <div className="uc-benefit">
            <span className="uc-benefit-icon uc-blue">
              <FiZap />
            </span>
            <strong>Reliable</strong>
            <span>Solutions</span>
          </div>
        </div>

        <a className="uc-contact" href="mailto:info@starlinkgoodspvtltd.com">
          <span className="uc-contact-icon">
            <FiMail />
          </span>
          <span className="uc-contact-copy">
            <strong>Stay Connected</strong>
            <span>We will be live soon...</span>
          </span>
          <FiArrowRight className="uc-contact-arrow" />
        </a>
      </section>

      {/* Right construction warning board */}
      <aside className="uc-work-area" aria-label="Construction in progress">
        <div className="uc-warning-board">
          <div className="uc-warning-top">
            <span />
            <span />
            <span />
          </div>

          <div className="uc-warning-content">
            <div className="uc-warning-icon">
              <FiTool />
            </div>
            <strong>WORK IN</strong>
            <strong>PROGRESS</strong>
          </div>

          <div className="uc-warning-bottom" />
          <div className="uc-board-leg uc-board-leg-left" />
          <div className="uc-board-leg uc-board-leg-right" />
        </div>

        <div className="uc-cone uc-cone-one" aria-hidden="true">
          <span />
        </div>

        <div className="uc-cone uc-cone-two" aria-hidden="true">
          <span />
        </div>

        <div className="uc-tools" aria-hidden="true">
          <span className="uc-wrench" />
          <span className="uc-screwdriver" />
        </div>
      </aside>

      <div className="uc-ground" aria-hidden="true" />
      <div className="uc-foreground-leaves" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </main>
  );
}
