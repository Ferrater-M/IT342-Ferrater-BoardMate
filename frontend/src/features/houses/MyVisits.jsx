import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../shared/styles/Nav.css";

const MyVisits = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole] = useState(localStorage.getItem("role"));
  const [userName] = useState(localStorage.getItem("name") || "User");
  const [profilePic] = useState(localStorage.getItem("profilePicture") || "");

  useEffect(() => {
    fetchMyVisits();
  }, []);

  const fetchMyVisits = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/visits/my-requests", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVisits(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching my visits:", err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>BoardMate</h2>
        <div style={styles.sideMenu}>
          <span onClick={() => navigate("/dashboard")} className="nav-item">Home</span>
          <span onClick={() => navigate("/rooms")} className="nav-item">Browse Rooms</span>
          <span onClick={() => navigate("/my-visits")} className="nav-item" style={{background: "rgba(255,255,255,0.1)", borderRadius: "8px"}}>My Visits</span>
          <span onClick={() => navigate("/contact")} className="nav-item">Contact</span>
        </div>
      </div>

      <div style={styles.main}>
        {/* TOP NAV */}
        <div style={styles.nav}>
          <div style={styles.logoText}>My Visit Requests</div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>{userName}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>{userRole === "ROLE_USER" ? "Boarder" : userRole === "ROLE_ADMIN" ? "Owner" : "Admin"}</div>
            </div>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#e5e7eb", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", border: "2px solid #1e3a8a" }}>
              {profilePic ? <img src={profilePic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "20px", color: "#1e3a8a", fontWeight: "bold" }}>{userName.charAt(0)}</span>}
            </div>
            <span style={{ color: "red", cursor: "pointer", fontSize: "14px" }} onClick={handleLogout}>Logout</span>
          </div>
        </div>

        <div style={styles.content}>
          <h2 style={{ marginBottom: "20px" }}>My Scheduled Visits</h2>
          
          {loading ? (
            <p>Loading your visits...</p>
          ) : visits.length > 0 ? (
            <div style={styles.grid}>
              {visits.map((visit) => (
                <div key={visit.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.houseName}>{visit.house?.name}</h3>
                    <span style={{
                      ...styles.statusBadge,
                      background: visit.status === "PENDING" ? "#fef3c7" : visit.status === "APPROVED" ? "#d1fae5" : visit.status === "REJECTED" ? "#fee2e2" : "#f1f5f9",
                      color: visit.status === "PENDING" ? "#92400e" : visit.status === "APPROVED" ? "#065f46" : visit.status === "REJECTED" ? "#991b1b" : "#475569"
                    }}>
                      {visit.status}
                    </span>
                  </div>
                  
                  <div style={styles.infoRow}>
                    <span style={styles.label}>📍 Location:</span>
                    <span>{visit.house?.location}</span>
                  </div>
                  
                  <div style={styles.infoRow}>
                    <span style={styles.label}>📅 Date & Time:</span>
                    <span style={{ fontWeight: "600" }}>{new Date(visit.requestedDateTime).toLocaleString()}</span>
                  </div>
                  
                  {visit.message && (
                    <div style={styles.messageBox}>
                      <span style={{ ...styles.label, display: "block", marginBottom: "5px" }}>My Message:</span>
                      <p style={{ margin: 0, fontStyle: "italic", fontSize: "14px" }}>"{visit.message}"</p>
                    </div>
                  )}
                  
                  <div style={styles.cardFooter}>
                    <span>Requested on {new Date(visit.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#1e3a8a" }}>No Visit Requests Yet</h3>
              <p style={{ color: "#666" }}>When you request to visit a boarding house, it will appear here.</p>
              <button 
                onClick={() => navigate("/rooms")}
                style={{ ...styles.button, marginTop: "20px" }}
              >
                Browse Boarding Houses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout: { display: "flex", height: "100vh", fontFamily: "Segoe UI, sans-serif" },
  sidebar: { width: "250px", background: "#1e3a8a", color: "white", padding: "20px" },
  sideMenu: { marginTop: "30px", display: "flex", flexDirection: "column", gap: "15px" },
  main: { flex: 1, background: "#f4f6fb", display: "flex", flexDirection: "column", minHeight: 0 },
  nav: { height: "60px", background: "white", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", borderBottom: "2px solid #ddd", flexShrink: 0 },
  logoText: { fontSize: "18px", fontWeight: "600", color: "#1e3a8a" },
  content: { padding: "30px", overflowY: "auto" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" },
  card: { background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #eee" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" },
  houseName: { margin: 0, fontSize: "18px", color: "#1e3a8a" },
  statusBadge: { fontSize: "11px", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase" },
  infoRow: { marginBottom: "10px", fontSize: "14px" },
  label: { color: "#64748b", marginRight: "8px" },
  messageBox: { background: "#f8fafc", padding: "12px", borderRadius: "8px", marginTop: "15px", border: "1px solid #e2e8f0" },
  cardFooter: { marginTop: "20px", paddingTop: "10px", borderTop: "1px solid #f1f5f9", fontSize: "12px", color: "#94a3b8", textAlign: "right" },
  button: { background: "#1e3a8a", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }
};

export default MyVisits;
