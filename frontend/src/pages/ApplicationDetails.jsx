import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/components/dashboard.css';

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      const response = await api.get(`/api/applications/${id}`);
      setApplication(response.data?.data || response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load application:', err);
      setError(err?.response?.data?.message || 'Failed to load application');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <Link to="/dashboard" style={{ marginBottom: 20, display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>
        <p>Loading application details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <Link to="/dashboard" style={{ marginBottom: 20, display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
      <Link 
        to="/dashboard" 
        style={{ 
          marginBottom: 20, 
          display: 'inline-block',
          color: '#0b1220',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        ← Back to Dashboard
      </Link>

      <h1>Application Details</h1>

      {application && (
        <div style={{ marginTop: 30 }}>
          {/* Application Info Card */}
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: 12, 
            padding: 24, 
            marginBottom: 20,
            background: '#fff',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Application Information</h2>
            
            <div style={{ display: 'grid', gap: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                <span style={{ fontWeight: 600, color: '#666' }}>Application ID:</span>
                <span>{application.id}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                <span style={{ fontWeight: 600, color: '#666' }}>Status:</span>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: 16, 
                  background: application.status === 'submitted' ? '#e3f2fd' : '#fff3cd',
                  color: application.status === 'submitted' ? '#1976d2' : '#856404',
                  fontSize: 14,
                  fontWeight: 600,
                }}>
                  {application.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                <span style={{ fontWeight: 600, color: '#666' }}>Full Name:</span>
                <span>{application.firstName} {application.lastName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                <span style={{ fontWeight: 600, color: '#666' }}>Email:</span>
                <span>{application.email}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                <span style={{ fontWeight: 600, color: '#666' }}>Program:</span>
                <span>{application.programName || application.programId || 'N/A'}</span>
              </div>

              {application.gpa && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                  <span style={{ fontWeight: 600, color: '#666' }}>GPA:</span>
                  <span>{application.gpa}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                <span style={{ fontWeight: 600, color: '#666' }}>Created:</span>
                <span>{new Date(application.createdAt).toLocaleDateString()}</span>
              </div>

              {application.updatedAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10 }}>
                  <span style={{ fontWeight: 600, color: '#666' }}>Last Updated:</span>
                  <span>{new Date(application.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 15 }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '12px 24px',
                background: '#0b1220',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Back to Dashboard
            </button>

            {application.status === 'draft' && (
              <button
                onClick={() => navigate('/apply')}
                style={{
                  padding: '12px 24px',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Continue Application
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}