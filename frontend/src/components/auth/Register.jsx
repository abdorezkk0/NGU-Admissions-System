import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as registerService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)");
      return;
    }

    if (!formData.phoneNumber) {
      setError("Phone number is required");
      return;
    }

    setLoading(true);

    try {
      console.log('Sending registration data:', {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });

      const response = await registerService({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
      });
      
      console.log('Registration response:', response);
      
      // Update auth context
      login(response.user);
      
      // Redirect to apply page
      navigate("/apply");
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err?.response?.data);
      
      const errorMessage = err?.response?.data?.message 
        || err?.response?.data?.error 
        || err?.response?.data?.errors?.[0]?.message
        || err.message 
        || "Registration failed";
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 500, margin: "40px auto" }}>
      <h1>Register</h1>
      <p style={{ opacity: 0.75, marginBottom: 20 }}>Create your account to apply.</p>

      <form onSubmit={onSubmit}>
        {/* Full Name */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
            Full Name *
          </label>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            type="text"
            required
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
            Email *
          </label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john.doe@example.com"
            type="email"
            required
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </div>

        {/* Phone Number */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
            Phone Number *
          </label>
          <input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+201234567890"
            type="tel"
            required
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <small style={{ color: '#666', fontSize: 12 }}>
            Format: +[country code][number] (e.g., +201234567890)
          </small>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
            Password *
          </label>
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="MyP@ssw0rd!"
            type="password"
            required
            minLength={6}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <small style={{ color: '#666', fontSize: 12, display: 'block', marginTop: 5 }}>
            Must contain: uppercase, lowercase, number, and special character (@$!%*?&)
          </small>
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
            Confirm Password *
          </label>
          <input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            type="password"
            required
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: loading ? "#ccc" : "#0b1220",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      {error && (
        <div style={{ 
          color: "#d32f2f", 
          marginTop: 15, 
          padding: 12, 
          background: '#ffebee', 
          borderRadius: 8,
          fontSize: 14,
        }}>
          ❌ {error}
        </div>
      )}
      
      <p style={{ marginTop: 20, textAlign: 'center', color: '#666' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: '#0b1220', fontWeight: 600 }}>
          Login here
        </a>
      </p>
    </div>
  );
}