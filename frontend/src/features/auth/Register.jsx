import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("ROLE_USER");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const inputStyle = {
    width: "100%",
    padding: "12px",
    fontSize: "1rem",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    } else {
      setEmailError("");
    }

    if (!passwordPattern.test(password)) {
      setPasswordError(
        "Password must have 1 uppercase letter, 1 number, 1 special character, and at least 6 characters"
      );
      return;
    } else {
      setPasswordError("");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned ${res.status} ${res.statusText}. Response body: ${text.substring(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || `Registration failed with status ${res.status}`);
      }

      navigate("/verify-pending", { state: { email } });

    } catch (err) {
      setError(err.message.replace(/["']/g, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "90vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Segoe UI, sans-serif", overflow: "hidden" }}>
      <div style={{ width: "1100px", height: "620px", display: "flex", borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", background: "white" }}>

        {/* LEFT SIDE */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", backgroundImage: "url('/bh1.jpg')", backgroundSize: "cover", backgroundPosition: "center", color: "white", padding: "40px" }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <h1 style={{ fontSize: "3rem", fontWeight: "800", letterSpacing: "-1px", marginBottom: "10px" }}>
              <span style={{ color: "#ffffff" }}>Board</span>
              <span style={{ color: "#2dd4bf" }}>Mate</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", marginBottom: "25px" }}>Join thousands of happy boarders</p>
            <p style={{ opacity: 0.8, lineHeight: "1.7", fontSize: "0.95rem" }}>
              Create your account and start finding the perfect boarding house today. Owners can also sign up to list their properties.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px", background: "#ffffff", fontSize: "18px", lineHeight: "1.6" }}>
          <div style={{ width: "100%", maxWidth: "360px" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "5px" }}>Create Account</h2>
            <p style={{ color: "#6b7280", marginBottom: "30px", fontSize: "1rem" }}>Sign up to get started with BoardMate</p>

            {error && (
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "0.95rem" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  placeholder="First Name"
                  style={{ ...inputStyle, width: "100%" }}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <input
                  placeholder="Last Name"
                  style={{ ...inputStyle, width: "100%" }}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>I am a:</label>
                <select
                  style={inputStyle}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="ROLE_USER">Student / Boarder</option>
                  <option value="ROLE_ADMIN">Boarding House Owner</option>
                </select>
              </div>
              
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); setError(""); }}
                  required
                  style={{ width: "100%", padding: "12px", fontSize: "1rem", borderRadius: "10px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                />
                {emailError && <p style={{ color: "red", fontSize: "0.85rem", marginTop: "4px" }}>{emailError}</p>}
              </div>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); setError(""); }}
                  required
                  style={{ width: "100%", padding: "12px", paddingRight: "40px", fontSize: "1rem", borderRadius: "10px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                />
                {password.length > 0 && (
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "18px", color: "#6b7280" }}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                )}
                {passwordError && <p style={{ color: "red", fontSize: "0.85rem", marginTop: "4px" }}>{passwordError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "14px", fontSize: "1rem", fontWeight: "600", borderRadius: "10px", border: "none", background: loading ? "#94a3b8" : "linear-gradient(180deg, #0b1445, #1e3a8a)", color: "white", cursor: loading ? "not-allowed" : "pointer", marginBottom: "20px" }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: "1rem", color: "#6b7280" }}>
              Already have an account? <Link to="/login" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;