import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";

const VerifyPending = () => {
  const location = useLocation();
  const email = location.state?.email || "";

  const [resendStatus, setResendStatus] = useState(null); 
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setResendStatus(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(180deg, #0b1445, #1e3a8a)", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "48px 40px", maxWidth: "460px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>

        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📧</div>

        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#0f172a", marginBottom: "10px" }}>
          Check your email
        </h2>

        <p style={{ color: "#6b7280", marginBottom: "8px", lineHeight: "1.6" }}>
          We sent a verification link to
        </p>

        {email && (
          <p style={{ fontWeight: "600", color: "#1e3a8a", marginBottom: "24px", wordBreak: "break-all" }}>
            {email}
          </p>
        )}

        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "32px", lineHeight: "1.6" }}>
          Click the link in the email to activate your account. If you don't see it, check your spam folder.
        </p>

        {resendStatus === "sent" && (
          <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "0.9rem" }}>
            Verification email resent! Please check your inbox.
          </div>
        )}

        {resendStatus === "error" && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "0.9rem" }}>
            Failed to resend. Please try again.
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={loading || !email}
          style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "1px solid #d1d5db", background: "white", color: "#1e3a8a", fontSize: "0.95rem", fontWeight: "600", cursor: loading || !email ? "not-allowed" : "pointer", marginBottom: "16px" }}
        >
          {loading ? "Resending..." : "Resend verification email"}
        </button>

        <Link to="/login" style={{ color: "#2563eb", fontSize: "0.9rem", textDecoration: "none", fontWeight: "600" }}>
          ← Back to login
        </Link>
      </div>
    </div>
  );
};

export default VerifyPending;