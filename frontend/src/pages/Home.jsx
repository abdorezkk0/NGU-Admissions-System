import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/home.css";
import heroImg from "../assets/images/hero.jpg";
import logo from "../assets/images/logo.png";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="landing">
      {/* NAVBAR */}
      <header className="landing__nav">
        <div className="landing__brand">
          <img src={logo} alt="NGU Admissions" className="landing__logo" />
          <span className="landing__brandText">NGU Admissions</span>
        </div>

        <div className="landing__navRight">
          <Link className="landing__navLink" to="/login">
            {isAuthenticated ? 'Dashboard' : 'Staff Portal'}
          </Link>

          {isAuthenticated ? (
            <Link className="btn btn--dark" to="/dashboard">
              My Dashboard
            </Link>
          ) : (
            <>
              <Link className="btn btn--ghost" to="/login" style={{ marginRight: 10 }}>
                Login
              </Link>
              <Link className="btn btn--dark" to="/apply">
                Apply Now
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="landing__hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="landing__overlay" />

        <div className="landing__heroContent">
          <h1 className="landing__title">
            Shape Your Future at <br /> NGU
          </h1>

          <p className="landing__subtitle">
            Join a community of innovators and leaders. Our unified admission
            portal makes your journey to excellence seamless and transparent.
          </p>

          <div className="landing__actions">
            {/* ✅ Changed from /application/new to /apply */}
            <Link className="btn btn--gold" to="/apply">
              Start Application <span className="arrow">→</span>
            </Link>

            <Link className="btn btn--ghost" to="/programs">
              Explore Programs
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing__section">
        <h2 className="landing__sectionTitle">Streamlined Admission Process</h2>
        <p className="landing__sectionText">
          Our smart system handles everything from document verification to eligibility checks,
          keeping you informed every step of the way.
        </p>

        <div className="landing__cards">
          <div className="featureCard">
            <div className="featureIcon">⏱️</div>
            <h3>Real-Time Tracking</h3>
            <p>
              Monitor your application status instantly. Get notifications when your
              documents are reviewed.
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">🛡️</div>
            <h3>Secure Document Vault</h3>
            <p>
              Upload and manage your academic records in a secure, encrypted environment.
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">✅</div>
            <h3>Automated Eligibility</h3>
            <p>
              Smart system automatically checks your qualifications against program requirements.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing__footer">
        <div className="landing__footerLeft">
          <img src={logo} alt="NGU" className="landing__footerLogo" />
          <span>NGU Admissions</span>
        </div>

        <div className="landing__footerRight">
          © {new Date().getFullYear()} New Giza University. All rights reserved.
        </div>
      </footer>

      {/* FLOAT BTN */}
      <button className="landing__floatBtn" aria-label="Help">
        💬
      </button>
    </div>
  );
}