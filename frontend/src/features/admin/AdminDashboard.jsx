import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif"
  },

  sidebar: {
    width: "250px",
    background: "#1e3a8a",
    color: "white",
    padding: "20px"
  },

  sideMenu: {
    marginTop: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },

  main: {
    flex: 1,
    background: "#f5f7fb",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto"
  },

  nav: {
    height: "60px",
    background: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "2px solid #ddd",
    flexShrink: 0
  },

  content: {
    padding: "30px"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px"
  },

  table: {
    width: "100%",
    background: "white",
    borderRadius: "12px",
    borderCollapse: "collapse",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  },

  th: {
    textAlign: "left",
    padding: "15px",
    background: "#1e3a8a",
    color: "white",
    fontSize: "14px"
  },

  td: {
    padding: "15px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
    color: "#333"
  },

  actionBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    marginRight: "8px"
  },

  addBtn: {
    padding: "10px 20px",
    background: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
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
    backdropFilter: "blur(4px)"
  },

  modal: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "500px",
    maxHeight: "90vh",
    overflowY: "auto"
  },

  formGroup: {
    marginBottom: "15px"
  },

  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
    fontWeight: "600"
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profilePicture") || ""
  );

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newPicUrl, setNewPicUrl] = useState("");
  const [isUpdatingPic, setIsUpdatingPic] = useState(false);

  const userName = localStorage.getItem("name") || "Admin";

  const userRole =
    localStorage.getItem("role") || "ROLE_SUPERADMIN";

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);

    await Promise.all([
      fetchApplications(),
      fetchHistory()
    ]);

    setLoading(false);
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "/api/applications/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setApplications(await res.json());

    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "/api/applications/history",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setHistory(await res.json());

    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleApprove = async (email) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "/api/applications/approve",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },

          body: JSON.stringify({ email })
        }
      );

      if (res.ok) {
        alert("Application Approved!");
        fetchAllData();
      } else {
        const d = await res.json();
        alert("Error: " + d.error);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (email) => {
    if (
      !window.confirm(
        "Are you sure you want to reject this application?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "/api/applications/reject",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },

          body: JSON.stringify({ email })
        }
      );

      if (res.ok) {
        alert("Application Rejected");
        fetchAllData();
      } else {
        const d = await res.json();
        alert("Error: " + d.error);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result;

      setNewPicUrl(base64String);
      setIsUpdatingPic(true);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "/api/auth/profile-picture",
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              profilePicture: base64String
            })
          }
        );

        if (res.ok) {
          const data = await res.json();

          setProfilePic(data.profilePicture);

          localStorage.setItem(
            "profilePicture",
            data.profilePicture
          );

          alert("Profile picture updated!");
        }

      } catch (err) {
        console.error(err);

      } finally {
        setIsUpdatingPic(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const tabStyle = (tab) => ({
    cursor: "pointer",
    fontWeight: activeTab === tab ? "bold" : "normal",
    background:
      activeTab === tab
        ? "rgba(255,255,255,0.1)"
        : "transparent",
    padding: "10px",
    borderRadius: "8px"
  });

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>BoardMate Admin</h2>

        <div style={styles.sideMenu}>
          <span
            onClick={() => setActiveTab("pending")}
            style={tabStyle("pending")}
          >
            Owner Applications
          </span>

          <span
            onClick={() => setActiveTab("history")}
            style={tabStyle("history")}
          >
            Application History
          </span>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.nav}>
          <div
            style={{
              fontWeight: "bold",
              color: "#1e3a8a"
            }}
          >
            System Administration
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px"
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  color: "#333"
                }}
              >
                {userName}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#666"
                }}
              >
                System Administrator
              </div>
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
                <img
                  src={profilePic}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: "16px",
                    color: "#1e3a8a",
                    fontWeight: "bold"
                  }}
                >
                  A
                </span>
              )}
            </div>

            <span
              style={{
                color: "red",
                cursor: "pointer",
                fontSize: "14px"
              }}
              onClick={handleLogout}
            >
              Logout
            </span>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.header}>
            <h2>{activeTab === "pending" ? "Pending Owner Applications" : "Application History"}</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>House Name</th>
                  <th style={styles.th}>Status</th>
                  {activeTab === "pending" && <th style={styles.th}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {(activeTab === "pending" ? applications : history).map((app, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{app.fullName || "-"}</td>
                    <td style={styles.td}>{app.email || "-"}</td>
                    <td style={styles.td}>{app.phoneNumber || "-"}</td>
                    <td style={styles.td}>{app.houseName || "-"}</td>
                    <td style={styles.td}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: app.status === "PENDING" ? "#fef3c7" : app.status === "APPROVED" ? "#d1fae5" : "#fee2e2",
                        color: app.status === "PENDING" ? "#92400e" : app.status === "APPROVED" ? "#065f46" : "#991b1b"
                      }}>
                        {app.status}
                      </span>
                    </td>
                    {activeTab === "pending" && (
                      <td style={styles.td}>
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;