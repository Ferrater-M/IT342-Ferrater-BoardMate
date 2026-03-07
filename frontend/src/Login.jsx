import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Segoe UI, sans-serif",
        background: "linear-gradient(180deg, #0b1445, #1e3a8a)",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          minHeight: "560px",
          display: "flex",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* LEFT SIDE – image panel */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: "url('/bh1.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "white",
            padding: "40px",
            minWidth: 0,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "340px" }}>
            <h1
              style={{
                fontSize: "2.8rem",
                fontWeight: "800",
                letterSpacing: "-1px",
                marginBottom: "10px",
              }}
            >
              <span style={{ color: "#ffffff" }}>Board</span>
              <span style={{ color: "#2dd4bf" }}>Mate</span>
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "1rem",
                marginBottom: "20px",
              }}
            >
              Find your perfect boarding house
            </p>

            <p style={{ opacity: 0.9, lineHeight: "1.7", fontSize: "0.95rem" }}>
              The smart way to find and manage your boarding house experience.
              Connect with owners, find your perfect room, and manage payments — all in one place.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE – form panel */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "48px 40px",
            background: "#ffffff",
            minWidth: 0,
          }}
        >
          <div style={{ width: "100%", maxWidth: "340px" }}>
            <h2
              style={{
                fontSize: "1.9rem",
                fontWeight: "700",
                marginBottom: "5px",
                color: "#0f172a",
              }}
            >
              Welcome Back
            </h2>

            <p style={{ color: "#6b7280", marginBottom: "28px" }}>
              Sign in to your account to continue
            </p>

            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* EMAIL */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontWeight: "600", fontSize: "0.875rem", marginBottom: "6px" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              {/* PASSWORD */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontWeight: "600", fontSize: "0.875rem" }}>Password</label>
                  <a href="#" style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.8rem" }}>
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "none",
                  background: loading ? "#94a3b8" : "linear-gradient(180deg, #0b1445, #1e3a8a)",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginBottom: "18px",
                  letterSpacing: "0.02em",
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280" }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;