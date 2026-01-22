import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "../../styles/components/dashboard.css";
import logo from "../../assets/images/logo.png";

export default function ApplicantDashboard() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await api.get('/api/applications/my-applications');
      const apps = response.data?.data || [];
      setApplications(apps);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setLoading(false);
    }
  };

  const summary = {
    status: applications.length > 0 ? applications[0].status : "No Applications",
    submittedAgo: applications.length > 0 ? "Recently submitted" : "N/A",
    docsVerified: "0/3 Verified",
    docsHint: "Upload required",
    eligible: false,
    eligibleHint: "Pending evaluation",
  };

  return (
    <div className="appDash">
      {/* SIDEBAR */}
      <aside className="appDash__sidebar">
        <div className="appDash__brand">
          <img src={logo} alt="NGU" />
          <span>NGU Admissions</span>
        </div>

        <nav className="appDash__nav">
          <Link className="appDash__navItem appDash__navItem--active" to="/dashboard">
            <span className="appDash__icon">▦</span>
            Dashboard
          </Link>

          <Link className="appDash__navItem" to="/apply">
            <span className="appDash__icon">▤</span>
            My Applications
          </Link>
        </nav>

        <div className="appDash__sidebarFooter">
          <button className="appDash__signout" type="button" onClick={logout}>
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
                <div className="appDash__profileName">{user?.fullName || user?.email || 'User'}</div>
                <div className="appDash__profileRole">Applicant</div>
              </div>
              <div className="appDash__avatar" aria-hidden="true">👤</div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <section className="appDash__content">
          <div className="appDash__heroRow">
            <div>
              <h1 className="appDash__title">Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}</h1>
              <p className="appDash__subtitle">
                Track your application progress and manage your documents.
              </p>
            </div>

            {/* ✅ FIXED: Changed from /application/new to /apply */}
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
                {summary.eligible ? "Eligible" : "Pending"}
              </div>
              <div className="appDash__cardHint">{summary.eligibleHint}</div>
            </div>
          </div>

          {/* APPLICATIONS LIST */}
          <h2 className="appDash__sectionTitle">My Applications</h2>

          {loading ? (
            <div>Loading applications...</div>
          ) : (
            <div className="appDash__appList">
              {applications.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', opacity: 0.6 }}>
                  <p>No applications yet. Click "New Application" to get started!</p>
                </div>
              ) : (
                applications.map((app) => (
                  <div className="appDash__appCard" key={app.id}>
                    <div className="appDash__appLeft">
                      <div className="appDash__statusRow">
                        <span className="appDash__statusPill">{app.status}</span>
                        <span className="appDash__appId">ID: {app.id?.slice(0, 8)}...</span>
                      </div>

                      <div className="appDash__appProgram">
                        {app.programName || 'Program'}
                      </div>
                      <div className="appDash__appDept">
                        {app.firstName} {app.lastName}
                      </div>

                      <div className="appDash__progressRow">
                        <div className="appDash__progressLabel">Application Progress</div>
                        <div className="appDash__progressPercent">
                          {app.status === 'draft' ? '30%' : app.status === 'submitted' ? '60%' : '100%'}
                        </div>
                      </div>

                      <div className="appDash__progressBar">
                        <div 
                          className="appDash__progressFill" 
                          style={{ 
                            width: app.status === 'draft' ? '30%' : app.status === 'submitted' ? '60%' : '100%' 
                          }} 
                        />
                      </div>
                    </div>

                    <div className="appDash__appRight">
                      <Link to={`/applications/${app.id}`}>
                        <button className="appDash__secondaryBtn" type="button">
                          View Details →
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* floating chat/help */}
        <button className="appDash__floatBtn" aria-label="Help">💬</button>
      </main>
    </div>
  );
}