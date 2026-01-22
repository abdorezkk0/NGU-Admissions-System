import React from 'react';

export default function Programs() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Available Programs</h1>
      <p>Browse our academic programs.</p>
      
      <div style={{ marginTop: 30 }}>
        <div style={{ border: '1px solid #ddd', padding: 20, marginBottom: 15, borderRadius: 8 }}>
          <h3>School of Dentistry</h3>
          <p>Minimum GPA: 3.2</p>
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: 20, marginBottom: 15, borderRadius: 8 }}>
          <h3>School of Information Technology</h3>
          <p>Minimum GPA: 3.0</p>
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: 20, marginBottom: 15, borderRadius: 8 }}>
          <h3>School of Engineering</h3>
          <p>Minimum GPA: 3.5</p>
        </div>
      </div>
    </div>
  );
}