import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../shared/styles/Nav.css";

const Rooms = () => {
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState(["All"]);
  const [imageIndexes, setImageIndexes] = useState({});
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const [userName] = useState(localStorage.getItem("name") || "User");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePicture") || "");
  const [newPicUrl, setNewPicUrl] = useState("");
  const [isUpdatingPic, setIsUpdatingPic] = useState(false);
  const navigate = useNavigate();

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
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || `Failed to fetch houses with status ${res.status}`);
          }
          return data;
        } else {
          const text = await res.text();
          throw new Error(`Server returned ${res.status} ${res.statusText}. Response body: ${text.substring(0, 100)}`);
        }
      })
      .then((data) => {
        setHouses(data);

        const uniqueLocs = ["All", ...new Set(data.map((h) => h.location))];
        setLocations(uniqueLocs);

        // Initialize image indexes
        const indexes = {};
        data.forEach(h => { indexes[h.id] = 0; });
        setImageIndexes(indexes);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching houses:", err);
        setLoading(false);
      });
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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

  const filtered =
    selectedLocation === "All"
      ? houses
      : houses.filter((h) => h.location === selectedLocation);

  return (
    <div style={styles.layout}>

      {/* LEFT SIDEBAR - LOCATIONS ONLY */}
      <div style={styles.sidebar}>
        <h2>BoardMate</h2>

        <h3 style={{marginTop: "40px", fontSize: "14px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px"}}>📍 Locations</h3>
        <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
          {locations.map((loc, i) => (
            <div
              key={i}
              onClick={() => setSelectedLocation(loc)}
              style={{
                padding: "10px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s",
                background: selectedLocation === loc ? "white" : "transparent",
                color: selectedLocation === loc ? "#1e3a8a" : "white",
                fontWeight: selectedLocation === loc ? "600" : "400",
              }}
            >
              {loc}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.main}>

        {/* TOP NAV */}
        <div style={styles.nav}>
          {/* LEFT: LOGO */}
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div style={styles.logoText}>BoardMate</div>
          </div>
          
          {/* CENTER: NAV LINKS */}
          <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
            <span onClick={() => navigate("/dashboard")} className="nav-item">Home</span>
            <span onClick={() => navigate("/rooms")} className="nav-item" style={{ color: "#1e3a8a", fontWeight: "bold" }}>Browse Rooms</span>
            <span onClick={() => navigate("/my-visits")} className="nav-item">My Visits</span>
            <span onClick={() => navigate("/contact")} className="nav-item">Contact</span>
            {userRole === "ROLE_ADMIN" && (
              <span onClick={() => navigate("/owner-dashboard")} className="nav-item" style={{ color: "#fbbf24", fontWeight: "bold" }}>Owner Dashboard</span>
            )}
            {userRole === "ROLE_SUPERADMIN" && (
              <span onClick={() => navigate("/admin")} className="nav-item" style={{ color: "#ef4444", fontWeight: "bold" }}>System Admin</span>
            )}
          </div>

          {/* RIGHT: USER PROFILE */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>{userName}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>{userRole === "ROLE_USER" ? "Boarder" : userRole === "ROLE_ADMIN" ? "Owner" : "Admin"}</div>
            </div>
            <div 
              onClick={() => setShowProfileModal(true)}
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

          <h2 style={{ marginTop: 0 }}>
            Browse Boarding Houses {selectedLocation !== "All" && `- ${selectedLocation}`}
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : filtered.length > 0 ? (
            <div style={styles.grid}>
              {filtered.map((house, index) => {
                const currentImages = house.imageUrls && house.imageUrls.length > 0 ? house.imageUrls : [house.imageUrl];
                const currentIndex = imageIndexes[house.id] || 0;

                return (
                  <div key={house.id} style={styles.houseCard}>
                    
                    {/* LEFT SIDE: IMAGE & TITLE */}
                    <div style={styles.cardLeft}>
                      <div style={styles.imageContainer}>
                        <img
                          src={currentImages[currentIndex]}
                          alt={house.name}
                          style={styles.image}
                        />
                        {currentImages.length > 1 && (
                          <>
                            <button 
                              style={{ ...styles.carouselBtn, left: "5px" }}
                              onClick={(e) => prevImage(e, house.id, currentImages.length)}
                            >
                              ‹
                            </button>
                            <button 
                              style={{ ...styles.carouselBtn, right: "5px" }}
                              onClick={(e) => nextImage(e, house.id, currentImages.length)}
                            >
                              ›
                            </button>
                          </>
                        )}
                      </div>
                      <h3 style={styles.houseTitle}>{house.name}</h3>
                    </div>

                    {/* RIGHT SIDE: DESCRIPTION & BUTTON */}
                    <div style={styles.cardRight}>
                      <div>
                        <p style={styles.desc}>{house.description}</p>
                        <div style={styles.metaInfo}>
                          <span>📍 {house.location}</span>
                          <span>⭐ {house.rating} Rating</span>
                          <span>🏠 {house.roomsLeft} room/s available</span>
                        </div>
                        <p style={styles.price}>{house.price}</p>
                      </div>

                      <button
                        style={styles.button}
                        onClick={() => navigate(`/roomdetails/${house.id}`)}
                      >
                        View Details
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#666" }}>
              No rooms found in this location.
            </p>
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
              onClick={() => setShowProfileModal(false)}
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

const styles = {

  layout: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    boxSizing: "border-box",
  },

  sidebar: {
    width: "250px",
    background: "#1e3a8a",
    color: "white",
    padding: "20px",
    overflowY: "auto",
  },

  sideMenu: {
    marginTop: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    background: "#f4f6fb",
  },

  nav: {
    height: "60px",
    minHeight: "60px",
    flexShrink: 0,
    background: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "2px solid #ddd",
  },

  logoText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e3a8a",
  },

  content: {
    padding: "20px",
    overflowY: "auto",
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
};

export default Rooms;