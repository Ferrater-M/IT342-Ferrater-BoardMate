import React from "react";

const Dashboard = () => {
  const houses = [
    {
      name: "Sunrise Boarding House",
      location: "Capitol Site, Cebu",
      price: "₱3,500/month",
    },
    {
      name: "Green Valley Lodge",
      location: "Guadalupe, Cebu",
      price: "₱4,000/month",
    },
    {
      name: "City Stay Boarding",
      location: "Fuente Osmeña, Cebu",
      price: "₱5,000/month",
    },
  ];

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <h2 style={styles.logo}>BoardMate</h2>

        <div style={styles.menu}>
          <span style={styles.active}>Home</span>
          <span>Browse Rooms</span>
          <span>Announcements</span>
          <span>Contact</span>
        </div>

        <div style={styles.right}>
          <span>Profile</span>
          <span style={{ color: "#ffdddd" }}>Logout</span>
        </div>
      </nav>

      {/* HERO */}
      <div style={styles.hero}>
        <h1>Find your next boarding room 🏠</h1>
        <p>Simple, fast, and hassle-free room discovery in one place.</p>

        <button style={styles.primaryBtn}>Browse Available Rooms</button>
      </div>

      {/* FEATURES */}
      <div style={styles.features}>
        <div style={styles.card}>
          <h3>🏠 Easy Browsing</h3>
          <p>Search available rooms near your area quickly.</p>
        </div>

        <div style={styles.card}>
          <h3>📍 Location Based</h3>
          <p>Find rooms close to your school or workplace.</p>
        </div>

        <div style={styles.card}>
          <h3>⚡ Fast Inquiry</h3>
          <p>Contact owners instantly without hassle.</p>
        </div>
      </div>

      {/* 🏠 BOARDING HOUSES LIST (NEW SECTION) */}
      <div style={styles.section}>
        <h2>🏠 Featured Boarding Houses</h2>

        <div style={styles.grid}>
          {houses.map((house, index) => (
            <div key={index} style={styles.houseCard}>
              <div style={styles.image}>🏠</div>

              <h3 style={{ marginBottom: "5px" }}>{house.name}</h3>
              <p style={{ color: "#666", margin: 0 }}>{house.location}</p>

              <p style={styles.price}>{house.price}</p>

              <button style={styles.button}>View Details</button>
            </div>
          ))}
        </div>
      </div>

      {/* 📢 ANNOUNCEMENTS */}
      <div style={styles.section}>
        <h2>📢 Latest Announcements</h2>

        <div style={styles.noticeCard}>Water interruption on Saturday</div>
        <div style={styles.noticeCard}>New rooms available this week</div>
        <div style={styles.noticeCard}>Maintenance scheduled for selected units</div>
      </div>

    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily: "Segoe UI, sans-serif",
  },

  /* NAV */
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

  menu: {
    display: "flex",
    gap: "25px",
  },

  active: {
    fontWeight: "bold",
    borderBottom: "2px solid white",
    paddingBottom: "3px",
  },

  right: {
    display: "flex",
    gap: "15px",
  },

  /* HERO */
  hero: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
  },

  primaryBtn: {
    marginTop: "15px",
    padding: "12px 20px",
    border: "none",
    background: "#1e3a8a",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },

  /* FEATURES */
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    padding: "30px",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  },

  /* ANNOUNCEMENTS */
  section: {
    maxWidth: "1100px",
    margin: "30px auto",
    padding: "0 20px",
  },

  noticeCard: {
    background: "white",
    padding: "15px",
    marginTop: "10px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },

  /* BOARDING HOUSES */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "15px",
  },

  houseCard: {
    background: "white",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  },

  image: {
    height: "100px",
    background: "#e5e7eb",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "35px",
    marginBottom: "10px",
  },

  price: {
    fontWeight: "bold",
    color: "#1e3a8a",
    marginTop: "10px",
  },

  button: {
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    border: "none",
    background: "#1e3a8a",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Dashboard;