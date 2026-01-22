import React from "react";
import { Link } from "react-router-dom";
import "../../styles/components/applicant/dashboard.css";
import logo from "../../assets/images/logo.png";

export default function ApplicantDashboard() {
  // later you will get this from auth context / API
  const user = { name: "Alice Johnson", role: "Applicant" };

  // later you will get these from API
  const summary = {
    status: "Under Review",
    submittedAgo: "Submitted 3 days ago",
    docsVerified: "2/3 Verified",
    docsHint: "1 Action required",
    eligible: true,
    eligibleHint: "Automated check passed",
  };

  const applications = [
    {
      id: "APP-2024-001",
      program: "B.Sc. Computer Science",
      dept: "Department of Engineering",
      status: "Under Review",
      progress: 60,
      alert: "Doc re-upload needed",
    },
  ];

  return (
    <div className="appDash">
      {/* SIDEBAR */}
      <aside className="appDash__sidebar">
        <div className="appDash__brand">
          <img src={logo} alt="NGU" />
          <span>NGU Admissions</span>
        </div>

        <nav className="appDash__nav">
          <Link className="appDash__navItem appDash__navItem--active" to="/applicant/dashboard">
            <span className="appDash__icon">▦</span>
            Dashboard
          </Link>

          <Link className="appDash__navItem" to="/applicant/applications">
            <span className="appDash__icon">▤</span>
            My Applications
          </Link>
        </nav>

        <div className="appDash__sidebarFooter">
          <button className="appDash__signout" type="button">
            ⟵ Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="appDash__main">
        {/* TOPBAR */}
        <header className="appDash__topbar">
          <div className="appDash__topbarLeft" />
          <div className="appDash__topbarRight">
            <button className="appDash__bell" aria-label="Notifications">🔔</button>

            <div className="appDash__profile">
              <div className="appDash__profileText">
                <div className="appDash__profileName">{user.name}</div>
                <div className="appDash__profileRole">{user.role}</div>
              </div>
              <div className="appDash__avatar" aria-hidden="true">👤</div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <section className="appDash__content">
          <div className="appDash__heroRow">
            <div>
              <h1 className="appDash__title">Welcome back, {user.name.split(" ")[0]}</h1>
              <p className="appDash__subtitle">
                Track your application progress and manage your documents.
              </p>
            </div>

            <Link className="appDash__primaryBtn" to="/apply">
              ＋ New Application
            </Link>
          </div>

          {/* SUMMARY CARDS */}
          <div className="appDash__cards">
            <div className="appDash__card">
              <div className="appDash__cardTop">
                <div className="appDash__cardLabel">Application Status</div>
                <div className="appDash__miniIcon">🕒</div>
              </div>
              <div className="appDash__cardValue">{summary.status}</div>
              <div className="appDash__cardHint">{summary.submittedAgo}</div>
            </div>

            <div className="appDash__card">
              <div className="appDash__cardTop">
                <div className="appDash__cardLabel">Documents</div>
                <div className="appDash__miniIcon">📄</div>
              </div>
              <div className="appDash__cardValue">{summary.docsVerified}</div>
              <div className="appDash__cardHint">{summary.docsHint}</div>
            </div>

            <div className="appDash__card">
              <div className="appDash__cardTop">
                <div className="appDash__cardLabel">Eligibility Check</div>
                <div className="appDash__miniIcon">✅</div>
              </div>
              <div className={`appDash__cardValue ${summary.eligible ? "ok" : "bad"}`}>
                {summary.eligible ? "Eligible" : "Not Eligible"}
              </div>
              <div className="appDash__cardHint">{summary.eligibleHint}</div>
            </div>
          </div>

          {/* APPLICATIONS LIST */}
          <h2 className="appDash__sectionTitle">My Applications</h2>

          <div className="appDash__appList">
            {applications.map((a) => (
              <div className="appDash__appCard" key={a.id}>
                <div className="appDash__appLeft">
                  <div className="appDash__statusRow">
                    <span className="appDash__statusPill">{a.status}</span>
                    <span className="appDash__appId">ID: {a.id}</span>
                  </div>

                  <div className="appDash__appProgram">{a.program}</div>
                  <div className="appDash__appDept">{a.dept}</div>

                  <div className="appDash__progressRow">
                    <div className="appDash__progressLabel">Application Progress</div>
                    <div className="appDash__progressPercent">{a.progress}%</div>
                  </div>

                  <div className="appDash__progressBar">
                    <div className="appDash__progressFill" style={{ width: `${a.progress}%` }} />
                  </div>
                </div>

                <div className="appDash__appRight">
                  <button className="appDash__secondaryBtn" type="button">
                    View Details →
                  </button>

                  {a.alert && (
                    <div className="appDash__alert">
                      <span className="appDash__alertIcon">⛔</span>
                      {a.alert}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* floating chat/help */}
        <button className="appDash__floatBtn" aria-label="Help">💬</button>
      </main>
    </div>
  );
}
