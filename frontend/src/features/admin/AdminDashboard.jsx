import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../shared/styles/Nav.css";

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },
  sidebar: {
    width: "250px",
    background: "#1e3a8a",
    color: "white",
    padding: "20px",
  },
  sideMenu: {
    marginTop: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  main: {
    flex: 1,
    background: "#f5f7fb",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  nav: {
    height: "60px",
    background: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "2px solid #ddd",
    flexShrink: 0,
  },
  content: {
    padding: "30px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  table: {
    width: "100%",
    background: "white",
    borderRadius: "12px",
    borderCollapse: "collapse",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  th: {
    textAlign: "left",
    padding: "15px",
    background: "#1e3a8a",
    color: "white",
    fontSize: "14px",
  },
  td: {
    padding: "15px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
    color: "#333",
  },
  actionBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    marginRight: "8px",
  },
  addBtn: {
    padding: "10px 20px",
    background: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePicture") || "");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newPicUrl, setNewPicUrl] = useState("");
  const [isUpdatingPic, setIsUpdatingPic] = useState(false);
  const userName = localStorage.getItem("name") || "Admin";
  const userRole = localStorage.getItem("role") || "ROLE_SUPERADMIN";

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchApplications(), fetchHistory()]);
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setNewPicUrl(base64String);
        
        setIsUpdatingPic(true);
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("/api/auth/profile-picture", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ profilePicture: base64String })
          });

          if (res.ok) {
            const data = await res.json();
            setProfilePic(data.profilePicture);
            localStorage.setItem("profilePicture", data.profilePicture);
            alert("Profile picture updated!");
          } else {
            alert("Failed to update profile picture");
          }
        } catch (err) {
          console.error("Error updating profile:", err);
        } finally {
          setIsUpdatingPic(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/applications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/applications/history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleApprove = async (email) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/upgrade", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        alert("Application Approved!");
        fetchAllData();
      }
    } catch (err) {
      console.error("Error approving application:", err);
    }
  };

  const handleReject = async (email) => {
    if (!window.confirm("Are you sure you want to reject this application?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/reject", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        alert("Application Rejected");
        fetchAllData();
      }
    } catch (err) {
      console.error("Error rejecting application:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <h2>BoardMate Admin</h2>
        <div style={styles.sideMenu}>
          <span 
            onClick={() => setActiveTab("pending")} 
            style={{ 
              cursor: "pointer", 
              fontWeight: activeTab === "pending" ? "bold" : "normal",
              background: activeTab === "pending" ? "rgba(255,255,255,0.1)" : "transparent",
              padding: "10px",
              borderRadius: "8px"
            }}
          >
            Owner Applications
          </span>
          <span 
            onClick={() => setActiveTab("history")} 
            style={{ 
              cursor: "pointer", 
              fontWeight: activeTab === "history" ? "bold" : "normal",
              background: activeTab === "history" ? "rgba(255,255,255,0.1)" : "transparent",
              padding: "10px",
              borderRadius: "8px"
            }}
          >
            Application History
          </span>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.nav}>
          <div style={{ fontWeight: "bold", color: "#1e3a8a" }}>System Administration</div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>{userName}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>System Administrator</div>
            </div>
            <div 
              onClick={() => setShowProfileModal(true)}
              style={{ 
                width: "35px", 
                height: "35px", 
                borderRadius: "50%", 
                background: "#e5e7eb", 
                cursor: "pointer",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid #1e3a8a"
              }}
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "16px", color: "#1e3a8a", fontWeight: "bold" }}>A</span>
              )}
            </div>
            <span style={{ color: "red", cursor: "pointer", fontSize: "14px" }} onClick={handleLogout}>Logout</span>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.header}>
            <h1>
              {activeTab === "pending" 
                ? "Pending Owner Applications" 
                : "Application History"}
            </h1>
          </div>

          {loading ? (
            <p>Loading applications...</p>
          ) : activeTab === "pending" ? (
            applications.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Applicant Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>House Name</th>
                    <th style={styles.th}>Address</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{app.fullName}</td>
                      <td style={styles.td}>{app.email}</td>
                      <td style={styles.td}>{app.houseName}</td>
                      <td style={styles.td}>{app.houseAddress}</td>
                      <td style={styles.td}>
                        <button 
                          style={{ ...styles.actionBtn, background: "#1e3a8a", color: "white" }}
                          onClick={() => setSelectedApp(app)}
                        >
                          View
                        </button>
                        <button 
                          style={{ ...styles.actionBtn, background: "#10b981", color: "white" }}
                          onClick={() => handleApprove(app.email)}
                        >
                          Approve
                        </button>
                        <button 
                          style={{ ...styles.actionBtn, background: "#ef4444", color: "white" }}
                          onClick={() => handleReject(app.email)}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "12px" }}>
                <h2>No Pending Applications</h2>
                <p>All owner partnership applications have been processed.</p>
              </div>
            )
          ) : activeTab === "history" ? (
            history.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Applicant Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>House Name</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((app, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{app.fullName}</td>
                      <td style={styles.td}>{app.email}</td>
                      <td style={styles.td}>{app.houseName}</td>
                      <td style={styles.td}>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "4px", 
                          fontSize: "12px", 
                          fontWeight: "bold",
                          background: app.status === "APPROVED" ? "#d1fae5" : "#fee2e2",
                          color: app.status === "APPROVED" ? "#065f46" : "#991b1b"
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button 
                          style={{ ...styles.actionBtn, background: "#1e3a8a", color: "white" }}
                          onClick={() => setSelectedApp(app)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "12px" }}>
                <h2>No History Found</h2>
                <p>Applications that have been approved or rejected will appear here.</p>
              </div>
            )
          ) : null}
        </div>
      </div>

      {/* APPLICATION DETAILS MODAL */}
      {selectedApp && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, width: "600px", maxWidth: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #1e3a8a", paddingBottom: "10px" }}>
              <h2 style={{ margin: 0, color: "#1e3a8a" }}>Application Details</h2>
              <button onClick={() => setSelectedApp(null)} style={{ border: "none", background: "none", fontSize: "24px", cursor: "pointer", color: "#666" }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Applicant Name</label>
                <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "14px" }}>{selectedApp.fullName}</div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "14px" }}>{selectedApp.email}</div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "14px" }}>{selectedApp.phoneNumber || "N/A"}</div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Permit Status</label>
                <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "14px", textTransform: "capitalize" }}>{selectedApp.hasBusinessPermit || "N/A"}</div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Boarding House Name</label>
              <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "14px", fontWeight: "600" }}>{selectedApp.houseName}</div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Property Address</label>
              <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "14px" }}>{selectedApp.houseAddress}</div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Management Experience</label>
              <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "14px", minHeight: "60px" }}>{selectedApp.experience || "N/A"}</div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Reason for Applying</label>
              <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "14px", minHeight: "60px" }}>{selectedApp.reason || "N/A"}</div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
              {selectedApp.status === "PENDING" && (
                <>
                  <button 
                    style={{ ...styles.addBtn, flex: 1, background: "#10b981" }}
                    onClick={() => {
                      handleApprove(selectedApp.email);
                      setSelectedApp(null);
                    }}
                  >
                    Approve Application
                  </button>
                  <button 
                    style={{ ...styles.addBtn, flex: 1, background: "#ef4444" }}
                    onClick={() => {
                      handleReject(selectedApp.email);
                      setSelectedApp(null);
                    }}
                  >
                    Reject Application
                  </button>
                </>
              )}
              <button 
                style={{ ...styles.addBtn, flex: 1, background: "#6b7280" }}
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PICTURE MODAL */}
      {showProfileModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, width: "350px", padding: "40px 30px" }}>
            <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 25px" }}>
              <div style={{ 
                width: "100%", 
                height: "100%", 
                borderRadius: "50%", 
                background: "#f3f4f6", 
                overflow: "hidden",
                border: "3px solid #1e3a8a",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
              }}>
                {(newPicUrl || profilePic) ? (
                  <img src={newPicUrl || profilePic} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "48px", color: "#1e3a8a", fontWeight: "bold" }}>{userName.charAt(0)}</span>
                )}
              </div>
              
              <label style={{
                position: "absolute",
                bottom: "5px",
                right: "5px",
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                background: "#1e3a8a",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                color: "white",
                border: "3px solid white",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
              }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: "none" }} 
                  onChange={handleFileChange} 
                />
                <span style={{ fontSize: "18px" }}>📷</span>
              </label>
            </div>

            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ color: "#1e3a8a", margin: "0 0 5px 0", fontSize: "22px" }}>{userName}</h2>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px", fontWeight: "600" }}>
                {userRole === "ROLE_USER" ? "Verified Boarder" : userRole === "ROLE_ADMIN" ? "Property Owner" : "System Administrator"}
              </p>
              <p style={{ margin: "5px 0 0 0", color: "#9ca3af", fontSize: "12px" }}>
                {localStorage.getItem("email")}
              </p>
            </div>

            <button 
              onClick={() => setShowProfileModal(false)}
              style={{ ...styles.addBtn, width: "100%", margin: 0, background: "#1e3a8a" }}
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
