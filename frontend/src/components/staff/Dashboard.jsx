import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/components/dashboard.css";
import logo from "../../assets/images/logo.png";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    pending: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0,
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch applications
      const response = await api.get('/api/applications');
      const apps = response.data?.data || [];
      
      setApplications(apps.slice(0, 5)); // Show latest 5

      // Calculate stats
      setStats({
        pending: apps.filter(a => a.status === 'pending').length,
        underReview: apps.filter(a => a.status === 'under_review').length,
        accepted: apps.filter(a => a.status === 'accepted').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
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
          <Link className="appDash__navItem appDash__navItem--active" to="/staff/dashboard">
            <span className="appDash__icon">▦</span>
            Dashboard
          </Link>

          <Link className="appDash__navItem" to="/staff/applications">
            <span className="appDash__icon">▤</span>
            Applications
          </Link>

          <Link className="appDash__navItem" to="/staff/documents">
            <span className="appDash__icon">📄</span>
            Documents
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
                <div className="appDash__profileName">{user?.firstName || user?.email || 'Staff'}</div>
                <div className="appDash__profileRole">Staff</div>
              </div>
              <div className="appDash__avatar" aria-hidden="true">👤</div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <section className="appDash__content">
          <div className="appDash__heroRow">
            <div>
              <h1 className="appDash__title">Staff Dashboard</h1>
              <p className="appDash__subtitle">
                Review and manage student applications
              </p>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div className="appDash__cards">
                <div className="appDash__card">
                  <div className="appDash__cardTop">
                    <div className="appDash__cardLabel">Pending Review</div>
                    <div className="appDash__miniIcon">🕒</div>
                  </div>
                  <div className="appDash__cardValue">{stats.pending}</div>
                  <div className="appDash__cardHint">Applications</div>
                </div>

                <div className="appDash__card">
                  <div className="appDash__cardTop">
                    <div className="appDash__cardLabel">Under Review</div>
                    <div className="appDash__miniIcon">📋</div>
                  </div>
                  <div className="appDash__cardValue">{stats.underReview}</div>
                  <div className="appDash__cardHint">In Progress</div>
                </div>

                <div className="appDash__card">
                  <div className="appDash__cardTop">
                    <div className="appDash__cardLabel">Accepted</div>
                    <div className="appDash__miniIcon">✅</div>
                  </div>
                  <div className="appDash__cardValue ok">{stats.accepted}</div>
                  <div className="appDash__cardHint">Applications</div>
                </div>

                <div className="appDash__card">
                  <div className="appDash__cardTop">
                    <div className="appDash__cardLabel">Rejected</div>
                    <div className="appDash__miniIcon">❌</div>
                  </div>
                  <div className="appDash__cardValue bad">{stats.rejected}</div>
                  <div className="appDash__cardHint">Applications</div>
                </div>
              </div>

              {/* RECENT APPLICATIONS */}
              <h2 className="appDash__sectionTitle">Recent Applications</h2>

              <div className="appDash__appList">
                {applications.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', opacity: 0.6 }}>
                    No applications found
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
                          {app.firstName} {app.lastName}
                        </div>
                        <div className="appDash__appDept">{app.email}</div>
                      </div>

                      <div className="appDash__appRight">
                        <Link to={`/staff/applications/${app.id}`}>
                          <button className="appDash__secondaryBtn" type="button">
                            Review →
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>

        {/* floating help */}
        <button className="appDash__floatBtn" aria-label="Help">💬</button>
      </main>
    </div>
  );
}