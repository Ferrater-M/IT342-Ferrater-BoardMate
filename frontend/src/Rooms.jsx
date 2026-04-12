import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Nav.css";

const Rooms = () => {
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState(["All"]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/houses")
      .then((res) => res.json())
      .then((data) => {
        setHouses(data);
        // Extract unique locations
        const uniqueLocs = ["All", ...new Set(data.map((h) => h.location))];
        setLocations(uniqueLocs);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error:", err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const filtered =
    selectedLocation === "All"
      ? houses
      : houses.filter((h) => h.location === selectedLocation);

  return (
    <div style={styles.layout}>

      {/* LEFT SIDEBAR (LOCATIONS ONLY) */}
      <div style={styles.sidebar}>
        <h3>📍 Locations</h3>

        {locations.map((loc, i) => (
          <div
            key={i}
            onClick={() => setSelectedLocation(loc)}
            style={{
              ...styles.location,
              background: selectedLocation === loc ? "white" : "#1e3a8a",
              color: selectedLocation === loc ? "#1e3a8a" : "white",
            }}
          >
            {loc}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.main}>

        {/* TOP NAV */}
        <div style={styles.nav}>

          {/* LOGO */}
          <div style={styles.logo}>🏠 BoardMate</div>

          {/* MENU MOVED HERE */}
          <div style={styles.menu}>
            <span onClick={() => navigate("/dashboard")} className="nav-item">Home</span>
            <span onClick={() => navigate("/rooms")} className="nav-item">Rooms</span>
            <span onClick={() => navigate("/announcements")} className="nav-item">Announcements</span>
            <span onClick={() => navigate("/contact")} className="nav-item">Contact</span>
          </div>

          {/* RIGHT ACTIONS */}
          <div style={styles.right}>
            <span>Profile</span>
            <span style={{ color: "red", cursor: "pointer" }} onClick={handleLogout}>Logout</span>
          </div>

        </div>

        {/* CONTENT */}
        <div style={styles.content}>

          <h2 style={{ marginTop: 0 }}>
            Rooms {selectedLocation !== "All" && `- ${selectedLocation}`}
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : filtered.length > 0 ? (
            <div style={styles.grid}>
              {filtered.map((house, index) => (
                <div key={index} style={styles.card}>

                  <img
                    src={house.imageUrl}
                    alt={house.name}
                    style={styles.image}
                  />

                  <div>
                    <h3>{house.name}</h3>
                    <p style={{ margin: 0, color: "#666" }}>
                      {house.location}
                    </p>

                    <p style={styles.price}>{house.price}</p>

                    <button style={styles.button}>View Details</button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#666" }}>No rooms found in this location.</p>
          )}
        </div>
      </div>
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

  /* SIDEBAR (LOCATIONS ONLY) */
  sidebar: {
    width: "250px",
    background: "#1e3a8a",
    color: "white",
    padding: "15px",
    overflowY: "auto",
  },

  location: {
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  /* RIGHT SIDE */
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    background: "#f4f6fb",
  },

  /* TOP NAV */
  nav: {
    height: "60px",
    minHeight: "60px",
    flexShrink: 0,
    background: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "1px solid #ddd",
  },

  logo: {
    fontWeight: "bold",
    color: "#1e3a8a",
  },

  menu: {
    display: "flex",
    gap: "20px",
  },

  right: {
    display: "flex",
    gap: "15px",
  },

  /* CONTENT */
  content: {
    padding: "20px",
    overflowY: "auto",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "15px",
  },

  card: {
    display: "flex",
    gap: "15px",
    background: "white",
    padding: "15px",
    borderRadius: "12px",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  },

  image: {
    width: "120px",
    height: "100px",
    background: "#e5e7eb",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
  },

  price: {
    fontWeight: "bold",
    color: "#1e3a8a",
    marginTop: "8px",
  },

  button: {
    marginTop: "8px",
    padding: "8px 12px",
    border: "none",
    background: "#1e3a8a",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
  
};

export default Rooms;