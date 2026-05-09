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
    minHeight: 0,
  },

  nav: {
    height: "60px",
    minHeight: "60px",
    background: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "2px solid #ddd",
    flexShrink: 0,
  },

  logoText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e3a8a",
  },

  right: {
    display: "flex",
    gap: "15px",
  },

  content: {
    padding: "20px",
    overflowY: "auto",
  },

  hero: {
    textAlign: "center",
    background: "white",
    padding: "40px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  search: {
    marginTop: "10px",
    width: "60%",
    padding: "10px",
    borderRadius: "15px",
    border: "1px solid #ccc",
  },

  features: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "20px",
  },

  card: {
    background: "white",
    padding: "15px",
    textAlign: "center",
    borderRadius: "8px",
  },

  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  houseCard: {
    display: "flex",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    gap: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  cardLeft: {
    flex: "0 0 200px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  cardRight: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  imageContainer: {
    position: "relative",
    height: "140px",
    width: "200px",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#f0f0f0",
  },

  image: {
    height: "100%",
    width: "100%",
    objectFit: "cover",
  },

  carouselBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.4)",
    color: "white",
    border: "none",
    padding: "5px 8px",
    cursor: "pointer",
    borderRadius: "50%",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  houseTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e3a8a",
  },

  desc: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.5",
    margin: "0 0 10px 0",
  },

  metaInfo: {
    fontSize: "13px",
    color: "#777",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  price: {
    fontWeight: "bold",
    color: "#1e3a8a",
    fontSize: "16px",
  },

  button: {
    marginTop: "auto",
    padding: "10px 20px",
    background: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    width: "fit-content",
    alignSelf: "flex-end",
  },

  cta: {
    marginTop: "30px",
    background: "#1e3a8a",
    color: "white",
    padding: "30px",
    borderRadius: "12px",
    textAlign: "center",
  },

  ctaButton: {
    marginTop: "10px",
    padding: "10px 20px",
    background: "white",
    color: "#1e3a8a",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
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
    borderRadius: "16px",
    width: "450px",
    maxWidth: "90%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
    fontSize: "14px",
    minHeight: "80px",
    fontFamily: "inherit",
  },
};
const Dashboard = () => {
  const navigate = useNavigate();

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAvailableOnly] = useState(false);
  const [imageIndexes, setImageIndexes] = useState({});
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const [userName] = useState(localStorage.getItem("name") || "User");
  const [appStatus, setAppStatus] = useState("NONE");
  const [showProfileModal, setShowApplyProfileModal] = useState(false);
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePicture") || "");
  const [newPicUrl, setNewPicUrl] = useState("");
  const [isUpdatingPic, setIsUpdatingPic] = useState(false);

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "ROLE_ADMIN") {
      navigate("/owner-dashboard");
      return;
    } else if (role === "ROLE_SUPERADMIN") {
      navigate("/admin");
      return;
    }

    fetch("/api/houses")
      .then((res) => res.json())
      .then((data) => {
        setHouses(data);
        // Initialize image indexes for each house
        const indexes = {};
        data.forEach(h => { indexes[h.id] = 0; });
        setImageIndexes(indexes);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error:", err);
        setLoading(false);
      });

    // Check application status if user is ROLE_USER
    if (localStorage.getItem("role") === "ROLE_USER") {
      const token = localStorage.getItem("token");
      fetch("/api/auth/application-status", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setAppStatus(data.status))
      .catch(err => console.error("Error checking status:", err));
    }
  }, []);

  const nextImage = (e, houseId, totalImages) => {
    e.stopPropagation();
    setImageIndexes(prev => ({
      ...prev,
      [houseId]: (prev[houseId] + 1) % totalImages
    }));
  };

  const prevImage = (e, houseId, totalImages) => {
    e.stopPropagation();
    setImageIndexes(prev => ({
      ...prev,
      [houseId]: (prev[houseId] - 1 + totalImages) % totalImages
    }));
  };

  const filteredHouses = houses.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         h.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Recommended logic: only show houses with rating >= 4.0 if not searching
    // If searching, show all matches.
    const isRecommended = searchTerm.length > 0 || h.rating >= 4.0;
    
    const matchesAvailable = showAvailableOnly ? h.roomsLeft > 0 : true;
    return matchesSearch && matchesAvailable && isRecommended;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleUpgrade = async () => {
    if (userRole === "ROLE_ADMIN" || userRole === "ROLE_SUPERADMIN") {
      navigate(userRole === "ROLE_ADMIN" ? "/owner-dashboard" : "/admin");
      return;
    }
    navigate("/apply-owner");
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!newPicUrl) return;
    
    setIsUpdatingPic(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/profile-picture", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ profilePicture: newPicUrl })
      });

      if (res.ok) {
        const data = await res.json();
        setProfilePic(data.profilePicture);
        localStorage.setItem("profilePicture", data.profilePicture);
        setShowApplyProfileModal(false);
        setNewPicUrl("");
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setNewPicUrl(base64String);
        
        // Auto-save when a file is selected
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

  return (
    <div style={styles.layout}>
      {/* LEFT SIDEBAR - DASHBOARD MENU */}
      <div style={styles.sidebar}>
        <h2>BoardMate</h2>
        <div style={styles.sideMenu}>
          <span onClick={() => navigate("/dashboard")} className="nav-item" style={{background: "rgba(255,255,255,0.1)", borderRadius: "8px"}}>Home</span>
          <span onClick={() => navigate("/rooms")} className="nav-item">Browse Rooms</span>
          <span onClick={() => navigate("/my-visits")} className="nav-item">My Visits</span>
          <span onClick={() => navigate("/contact")} className="nav-item">Contact</span>
          {userRole === "ROLE_ADMIN" && (
            <span onClick={() => navigate("/owner-dashboard")} className="nav-item" style={{ marginTop: "20px", color: "#fbbf24", fontWeight: "bold" }}>Owner Dashboard</span>
          )}
          {userRole === "ROLE_SUPERADMIN" && (
            <span onClick={() => navigate("/admin")} className="nav-item" style={{ marginTop: "20px", color: "#ef4444", fontWeight: "bold" }}>System Admin</span>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.main}>

        {/* TOP NAV */}
        <div style={styles.nav}>
          <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
            <div style={styles.logoText}>BoardMate</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>{userName}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>{userRole === "ROLE_USER" ? "Boarder" : userRole === "ROLE_ADMIN" ? "Owner" : "Admin"}</div>
            </div>
            <div 
              onClick={() => setShowApplyProfileModal(true)}
              style={{ 
                width: "40px", 
                height: "40px", 
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
                <span style={{ fontSize: "20px", color: "#1e3a8a", fontWeight: "bold" }}>{userName.charAt(0)}</span>
              )}
            </div>
            <span style={{ color: "red", cursor: "pointer", fontSize: "14px" }} onClick={handleLogout}>Logout</span>
          </div>
        </div>

        {/* CONTENT */}
        <div style={styles.content}>

          {/* HERO */}
          <div style={styles.hero}>
            <h1>Find your next boarding room</h1>
            <p>Simple, fast, and hassle-free room discovery.</p>

            <input
              type="text"
              placeholder="Search boarding house..."
              style={styles.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* FEATURES */}
          <div style={styles.features}>
            <div style={styles.card}>Easy Browsing</div>
            <div style={styles.card}>Location Based</div>
            <div style={styles.card}>Fast Inquiry</div>
          </div>

          {/* HOUSES */}
          <h2>Recommended for You</h2>

          {loading ? (
            <p>Loading...</p>
          ) : filteredHouses.length > 0 ? (
            <div style={styles.grid}>
              {filteredHouses.map((h, i) => {
                const currentImages = h.imageUrls && h.imageUrls.length > 0 ? h.imageUrls : [h.imageUrl];
                const currentIndex = imageIndexes[h.id] || 0;

                return (
                  <div key={h.id} style={styles.houseCard}>
                    
                    {/* LEFT SIDE: IMAGE & TITLE */}
                    <div style={styles.cardLeft}>
                      <div style={styles.imageContainer}>
                        {h.rating >= 4.5 && (
                          <div style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            background: "#2dd4bf",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: "bold",
                            zIndex: 1
                          }}>
                            TOP PICK
                          </div>
                        )}
                        <img
                          src={currentImages[currentIndex]}
                          alt={h.name}
                          style={styles.image}
                        />
                        {currentImages.length > 1 && (
                          <>
                            <button 
                              style={{ ...styles.carouselBtn, left: "5px" }}
                              onClick={(e) => prevImage(e, h.id, currentImages.length)}
                            >
                              ‹
                            </button>
                            <button 
                              style={{ ...styles.carouselBtn, right: "5px" }}
                              onClick={(e) => nextImage(e, h.id, currentImages.length)}
                            >
                              ›
                            </button>
                          </>
                        )}
                      </div>
                      <h3 style={styles.houseTitle}>{h.name}</h3>
                    </div>

                    {/* RIGHT SIDE: DESCRIPTION & BUTTON */}
                    <div style={styles.cardRight}>
                      <div>
                        <p style={styles.desc}>{h.description}</p>
                        <div style={styles.metaInfo}>
                          <span>📍 {h.location}</span>
                          <span>⭐ {h.rating} Rating</span>
                          <span>🏠 {h.roomsLeft} rooms available</span>
                        </div>
                        <p style={styles.price}>{h.price}</p>
                      </div>

                      <button
                        style={styles.button}
                        onClick={() => navigate(`/roomdetails/${h.id}`)}
                      >
                        Check Out
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#666" }}>No boarding houses found.</p>
          )}

          {/* CTA */}
          {userRole === "ROLE_USER" && (
            <div style={styles.cta}>
              <h2>Are you a boarding house owner?</h2>
              <p>List your property and get students easily in Cebu.</p>
              
              {appStatus === "PENDING" && (
                <div style={{ background: "#fef3c7", color: "#92400e", padding: "10px", borderRadius: "8px", marginTop: "10px", fontWeight: "600" }}>
                  ⏳ Your application is currently being reviewed by an administrator.
                </div>
              )}

              {appStatus === "REJECTED" && (
                <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "8px", marginTop: "10px", fontWeight: "600" }}>
                  ❌ Your application was not approved. You can try applying again with more details.
                </div>
              )}

              {(appStatus === "NONE" || appStatus === "REJECTED") && (
                <button 
                  style={styles.ctaButton}
                  onClick={handleUpgrade}
                >
                  {appStatus === "REJECTED" ? "Re-apply as Owner" : "List Your Boarding House"}
                </button>
              )}
            </div>
          )}

        </div>
      </div>

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
              onClick={() => setShowApplyProfileModal(false)}
              style={{ ...styles.button, width: "100%", margin: 0, background: "#1e3a8a" }}
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;