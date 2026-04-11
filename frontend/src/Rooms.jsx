import React, { useState } from "react";

const Rooms = () => {
  const [selectedLocation, setSelectedLocation] = useState("All");

  const locations = [
    "All",
    "Capitol Site",
    "Guadalupe",
    "Fuente Osmeña",
    "Mabolo",
  ];

  const houses = [
    { name: "Sunrise Boarding House", location: "Capitol Site", price: "₱3,500/month" },
    { name: "Green Valley Lodge", location: "Guadalupe", price: "₱4,000/month" },
    { name: "City Stay Boarding", location: "Fuente Osmeña", price: "₱5,000/month" },
    { name: "Comfort Nest", location: "Mabolo", price: "₱3,000/month" },
  ];

  const filtered =
    selectedLocation === "All"
      ? houses
      : houses.filter((h) => h.location === selectedLocation);

  return (
    <div style={styles.page}>

      {/* 🔵 TOP NAVBAR */}
      <nav style={styles.nav}>
        <h2 style={styles.logo}>BoardMate</h2>

        <div style={styles.navLinks}>
          <span>Home</span>
          <span style={{ fontWeight: "bold" }}>Rooms</span>
          <span>Announcements</span>
          <span>Contact</span>
        </div>

        <div style={styles.right}>
          <span>Profile</span>
          <span style={{ color: "#ffdddd" }}>Logout</span>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div style={styles.layout}>

        {/* LEFT SIDEBAR */}
        <div style={styles.sidebar}>
          <h3 style={{ marginTop: 0 }}>📍 Locations</h3>

          {locations.map((loc, i) => (
            <div
              key={i}
              onClick={() => setSelectedLocation(loc)}
              style={{
                ...styles.location,
                background: selectedLocation === loc ? "#1e3a8a" : "#f1f5f9",
                color: selectedLocation === loc ? "white" : "black",
              }}
            >
              {loc}
            </div>
          ))}
        </div>

        {/* RIGHT CONTENT */}
        <div style={styles.content}>
          <h2 style={{ marginTop: 0 }}>
            Rooms {selectedLocation !== "All" && `- ${selectedLocation}`}
          </h2>

          <div style={styles.grid}>
            {filtered.map((house, index) => (
              <div key={index} style={styles.card}>

                <div style={styles.image}>🏠</div>

                <div>
                  <h3 style={{ marginBottom: "5px" }}>{house.name}</h3>
                  <p style={{ margin: 0, color: "#666" }}>
                    {house.location}
                  </p>

                  <p style={styles.price}>{house.price}</p>

                  <button style={styles.button}>View Details</button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6fb",
    fontFamily: "Segoe UI, sans-serif",
  },

  /* 🔵 NAVBAR */
  nav: {
    height: "60px",
    background: "#1e3a8a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 25px",
    color: "white",
  },

  logo: { margin: 0 },

  navLinks: {
    display: "flex",
    gap: "25px",
  },

  right: {
    display: "flex",
    gap: "15px",
  },

  /* LAYOUT */
  layout: {
    display: "flex",
  },

  /* LEFT SIDEBAR */
  sidebar: {
    width: "300px",
    height: "calc(100vh - 60px)",
    background: "white",
    padding: "20px",
    position: "fixed",
    left: 0,
    top: "60px",
    boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
  },

  location: {
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  /* RIGHT CONTENT */
  content: {
    marginLeft: "300px",
    padding: "20px",
    marginTop: "60px",
    width: "100%",
  },

  /* LIST */
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
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
    alignItems: "center",
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
    flexShrink: 0,
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