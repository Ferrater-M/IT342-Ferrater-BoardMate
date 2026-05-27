import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        
        if (!res.ok) {
          const text = await res.text();
          console.error("Server error response:", text);
          throw new Error(`Server returned status ${res.status}`);
        }

        setStatus("success");
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        console.error("Verification failed:", err);
        setErrorMessage(err.message);
        setStatus("error");
      }
    };

    verify();
  }, [searchParams, navigate]);

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    },
    card: {
      background: "white",
      padding: "40px",
      borderRadius: "12px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
      maxWidth: "400px",
      textAlign: "center"
    },
    icon: {
      fontSize: "64px",
      marginBottom: "20px"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === "loading" && (
          <>
            <div style={styles.icon}>⏳</div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we verify your account.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={styles.icon}>✅</div>
            <h2>Email verified successfully!</h2>
            <p>Redirecting you to login in 3 seconds...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div style={styles.icon}>❌</div>
            <h2>Verification failed</h2>
            <p style={{ color: "#666" }}>{errorMessage || "Invalid or expired verification link."}</p>
            <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                style={{
                  padding: "10px 20px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  background: "#f3f4f6",
                  color: "#333",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
