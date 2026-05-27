import { useLocation, useNavigate } from "react-router-dom";

const VerifyPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

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
      maxWidth: "450px",
      textAlign: "center"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>📧</div>
        <h2>Check your email!</h2>
        {email && <p style={{ fontSize: "16px", color: "#333" }}>We've sent a verification link to <strong>{email}</strong></p>}
        <p style={{ marginTop: "15px", color: "#666" }}>
          Click the link in the email to verify your account and start using BoardMate!
        </p>
        <div style={{ marginTop: "30px" }}>
          <button
            style={{
              padding: "12px 24px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              marginRight: "10px"
            }}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
          <button
            style={{
              padding: "12px 24px",
              background: "#f3f4f6",
              color: "#333",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px"
            }}
            onClick={() => navigate("/register")}
          >
            Register Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyPending;
