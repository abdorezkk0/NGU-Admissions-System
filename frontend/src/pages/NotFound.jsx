import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">
        <button style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer' }}>
          Go Home
        </button>
      </Link>
    </div>
  );
}