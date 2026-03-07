import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #0b1445 0%, #1e3a8a 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: "3rem",
          fontWeight: "800",
          letterSpacing: "2px",
        }}
      >
        DASHBOARD
      </h1>
    </div>
  );
};

export default Dashboard;