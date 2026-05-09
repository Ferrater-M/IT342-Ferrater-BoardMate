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

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("name") || "Owner";
  const [houses, setHouses] = useState([]);
  const [visitRequests, setVisitRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("houses");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentHouse, setCurrentHouse] = useState(null);
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePicture") || "");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newPicUrl, setNewPicUrl] = useState("");
  const [isUpdatingPic, setIsUpdatingPic] = useState(false);
  const userRole = localStorage.getItem("role") || "ROLE_ADMIN";
   const [formData, setFormData] = useState({
     name: "",
     location: "",
     description: "",
     price: "",
     imageUrl: "",
     initialRoomCount: 0,
   });

  useEffect(() => {
    fetchHouses();
    fetchVisitRequests();
  }, []);

  const fetchVisitRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/visits/owner/requests", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVisitRequests(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
      console.error("Error fetching visit requests:", err);
    }
  };

  const handleUpdateVisitStatus = async (requestId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/visits/${requestId}/status`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        alert("Visit request " + status.toLowerCase());
        fetchVisitRequests();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating visit status:", err);
    }
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

  const fetchHouses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/houses/my-houses", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Fetching houses failed with status ${res.status}`);
        }
        setHouses(data);
      } else {
        const text = await res.text();
        throw new Error(`Server returned ${res.status} ${res.statusText}. Response body: ${text.substring(0, 100)}`);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching houses:", err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const openModal = (house = null) => {
    if (house) {
      setCurrentHouse(house);
      setFormData({
        name: house.name,
        location: house.location,
        description: house.description,
        price: house.price,
        imageUrl: house.imageUrl,
        initialRoomCount: 0,
      });
    } else {
      setCurrentHouse(null);
      setFormData({
        name: "",
        location: "",
        description: "",
        price: "",
        imageUrl: "",
        initialRoomCount: 0,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentHouse ? "PUT" : "POST";
    const url = currentHouse ? `/api/houses/${currentHouse.id}` : "/api/houses";
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchHouses();
      } else {
        alert("Failed to save boarding house");
      }
    } catch (err) {
      console.error("Error saving house:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this boarding house?")) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`/api/houses/${id}`, { 
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          fetchHouses();
        } else {
          alert("Failed to delete boarding house");
        }
      } catch (err) {
        console.error("Error deleting house:", err);
      }
    }
  };

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <h2>BoardMate Owner</h2>
        <div style={styles.sideMenu}>
          <span 
            onClick={() => setActiveTab("houses")} 
            style={{ 
              cursor: "pointer", 
              fontWeight: activeTab === "houses" ? "bold" : "normal",
              background: activeTab === "houses" ? "rgba(255,255,255,0.1)" : "transparent",
              padding: "10px",
              borderRadius: "8px"
            }}
          >
            Manage Houses
          </span>
          <span 
            onClick={() => setActiveTab("visits")} 
            style={{ 
              cursor: "pointer", 
              fontWeight: activeTab === "visits" ? "bold" : "normal",
              background: activeTab === "visits" ? "rgba(255,255,255,0.1)" : "transparent",
              padding: "10px",
              borderRadius: "8px"
            }}
          >
            Visit Requests
          </span>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.nav}>
          <div style={{ fontWeight: "bold", color: "#1e3a8a" }}>Welcome, {userName} (Owner)</div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>{userName}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>Property Owner</div>
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
                <span style={{ fontSize: "16px", color: "#1e3a8a", fontWeight: "bold" }}>{userName.charAt(0)}</span>
              )}
            </div>
            <span style={{ color: "red", cursor: "pointer", fontSize: "14px" }} onClick={handleLogout}>Logout</span>
          </div>
        </div>

        <div style={styles.content}>
          {activeTab === "houses" ? (
            <>
              <div style={styles.header}>
                <h1>My Boarding Houses</h1>
                <button style={styles.addBtn} onClick={() => openModal()}>+ Add New House</button>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : houses.length > 0 ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Location</th>
                      <th style={styles.th}>Price</th>
                      <th style={styles.th}>Rooms Left</th>
                      <th style={styles.th}>Rating</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {houses.map((h) => (
                      <tr key={h.id}>
                        <td style={styles.td}>{h.name}</td>
                        <td style={styles.td}>{h.location}</td>
                        <td style={styles.td}>{h.price}</td>
                        <td style={styles.td}>{h.roomsLeft}</td>
                        <td style={styles.td}>{h.rating}</td>
                        <td style={styles.td}>
                          <button 
                            style={{ ...styles.actionBtn, background: "#f59e0b", color: "white" }}
                            onClick={() => openModal(h)}
                          >
                            Edit
                          </button>
                          <button 
                            style={{ ...styles.actionBtn, background: "#ef4444", color: "white" }}
                            onClick={() => handleDelete(h.id)}
                          >
                            Delete
                          </button>
                          <button 
                            style={{ ...styles.actionBtn, background: "#1e3a8a", color: "white" }}
                            onClick={() => navigate(`/owner/house/${h.id}/rooms`)}
                          >
                            Manage Rooms
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                  <h2 style={{ color: "#1e3a8a" }}>No Boarding Houses Yet</h2>
                  <p style={{ color: "#666" }}>Click the "+ Add New House" button to start managing your properties.</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={styles.header}>
                <h1>Visit Requests</h1>
              </div>

              {visitRequests.length > 0 ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Student Name</th>
                      <th style={styles.th}>House</th>
                      <th style={styles.th}>Date & Time</th>
                      <th style={styles.th}>Message</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitRequests.map((req) => (
                      <tr key={req.id}>
                        <td style={styles.td}>{req.user?.firstName} {req.user?.lastName}</td>
                        <td style={styles.td}>{req.house?.name}</td>
                        <td style={styles.td}>{new Date(req.requestedDateTime).toLocaleString()}</td>
                        <td style={styles.td}>{req.message || "-"}</td>
                        <td style={styles.td}>
                          <span style={{ 
                            padding: "4px 10px", 
                            borderRadius: "20px", 
                            fontSize: "12px", 
                            fontWeight: "bold",
                            background: req.status === "PENDING" ? "#fef3c7" : req.status === "APPROVED" ? "#d1fae5" : "#fee2e2",
                            color: req.status === "PENDING" ? "#92400e" : req.status === "APPROVED" ? "#065f46" : "#991b1b"
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {req.status === "PENDING" && (
                            <>
                              <button 
                                style={{ ...styles.actionBtn, background: "#10b981", color: "white" }}
                                onClick={() => handleUpdateVisitStatus(req.id, "APPROVED")}
                              >
                                Approve
                              </button>
                              <button 
                                style={{ ...styles.actionBtn, background: "#ef4444", color: "white" }}
                                onClick={() => handleUpdateVisitStatus(req.id, "REJECTED")}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {req.status === "APPROVED" && (
                            <button 
                              style={{ ...styles.actionBtn, background: "#1e3a8a", color: "white" }}
                              onClick={() => handleUpdateVisitStatus(req.id, "COMPLETED")}
                            >
                              Mark Completed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                  <h2 style={{ color: "#1e3a8a" }}>No Visit Requests</h2>
                  <p style={{ color: "#666" }}>When students request to visit your houses, they will appear here.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>{currentHouse ? "Edit Boarding House" : "Add New Boarding House"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>House Name</label>
                <input
                  style={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input
                  style={styles.input}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, height: "100px" }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price (e.g. ₱2,000 - ₱5,000)</label>
                <input
                  style={styles.input}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Image URL</label>
                <input
                  style={styles.input}
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                />
              </div>
              {!currentHouse && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Initial Room Count</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={formData.initialRoomCount}
                    onChange={(e) => setFormData({ ...formData, initialRoomCount: parseInt(e.target.value) })}
                    required
                  />
                </div>
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{ ...styles.addBtn, flex: 1 }}>Save</button>
                <button type="button" style={{ ...styles.addBtn, flex: 1, background: "#6b7280" }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
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

export default OwnerDashboard;
