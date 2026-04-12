import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Nav.css";
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
  },

  houseCard: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
  },

  image: {
    height: "120px",
    width: "100%",
    objectFit: "contain",
    objectPosition: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    marginBottom: "10px",
  },

  desc: {
    fontSize: "13px",
    color: "#666",
  },

  availableRooms: {
    color: "#1e3a8a",
    fontWeight: "normal",
    fontSize: "12px",
  },

  price: {
    fontWeight: "bold",
    color: "#1e3a8a",
  },

  button: {
    marginTop: "10px",
    padding: "10px",
    background: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    width: "100%",
    cursor: "pointer",
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
};
const Dashboard = () => {
  const navigate = useNavigate();

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAvailableOnly] = useState(false);

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
    fetch("/api/houses")
      .then((res) => res.json())
      .then((data) => {
        setHouses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error:", err);
        setLoading(false);
      });
  }, []);

  const filteredHouses = houses.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         h.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailable = showAvailableOnly ? h.roomsLeft > 0 : true;
    return matchesSearch && matchesAvailable;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.layout}>

      {/* LEFT SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>BoardMate</h2>

        <div style={styles.sideMenu}>
          <span onClick={() => navigate("/dashboard")} className="nav-item">Home</span>
          <span onClick={() => navigate("/rooms")} className="nav-item">Browse Rooms</span>
          <span onClick={() => navigate("/Announcements")} className="nav-item">Announcements</span>
          <span onClick={() => navigate("/Contact")} className="nav-item">Contact</span>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.main}>

        {/* TOP NAV */}
        <div style={styles.nav}>
          <div style={styles.logoText}>BoardMate</div>

          <div style={styles.right}>
            <span>Profile</span>
            <span style={{ color: "red", cursor: "pointer" }} onClick={handleLogout}>Logout</span>
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
              {filteredHouses.map((h, i) => (
                <div key={i} style={styles.houseCard}>

                  <img
                    src={h.imageUrl}
                    alt={h.name}
                    style={styles.image}
                  />

                  <h3>{h.name}</h3>
                  <p style={{ margin: 0 }}>{h.location}</p>

                  <p style={styles.desc}>{h.description}</p>

                  <p>⭐ {h.rating} Rating</p>

                  <p style={styles.availableRooms}>
                    Available Rooms: {h.roomsLeft}
                  </p>

                  <p style={styles.price}>{h.price}</p>

                  <button style={styles.button}>View Details</button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#666" }}>No boarding houses found.</p>
          )}

          {/* CTA */}
          <div style={styles.cta}>
            <h2>Are you a boarding house owner?</h2>
            <p>List your property and get students easily in Cebu.</p>
            <button style={styles.ctaButton}>List Your Boarding House</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;