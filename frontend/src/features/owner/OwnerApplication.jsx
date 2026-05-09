import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OwnerApplication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    phoneNumber: "",
    houseName: "",
    houseAddress: "",
    totalRooms: "",
    hasBusinessPermit: "no",
    experience: "",
    reason: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/apply", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("Application Submitted Successfully! Please wait for system administrator approval.");
        navigate("/dashboard");
      } else {
        const data = await res.json();
        alert("Application failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.header}>
          <h1 style={styles.title}>Owner Partnership Application</h1>
          <p style={styles.subtitle}>Fill out the form below to list your property on BoardMate.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.row}>
              <div style={styles.group}>
                <label style={styles.label}>Full Name</label>
                <input 
                  style={styles.input} 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required 
                />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Email Address</label>
                <input 
                  style={styles.input} 
                  type="email"
                  value={formData.email} 
                  disabled
                />
              </div>
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Contact Number</label>
              <input 
                style={styles.input} 
                placeholder="e.g. 0912 345 6789"
                value={formData.phoneNumber} 
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                required 
              />
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Property Details</h3>
            <div style={styles.group}>
              <label style={styles.label}>Boarding House Name</label>
              <input 
                style={styles.input} 
                placeholder="e.g. Sunset Heights Dormitory"
                value={formData.houseName} 
                onChange={(e) => setFormData({...formData, houseName: e.target.value})}
                required 
              />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Complete Address</label>
              <input 
                style={styles.input} 
                placeholder="Street, Barangay, City"
                value={formData.houseAddress} 
                onChange={(e) => setFormData({...formData, houseAddress: e.target.value})}
                required 
              />
            </div>
            <div style={styles.row}>
              <div style={styles.group}>
                <label style={styles.label}>Total Number of Rooms</label>
                <input 
                  style={styles.input} 
                  type="number"
                  placeholder="0"
                  value={formData.totalRooms} 
                  onChange={(e) => setFormData({...formData, totalRooms: e.target.value})}
                  required 
                />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Do you have a Business Permit?</label>
                <select 
                  style={styles.input}
                  value={formData.hasBusinessPermit}
                  onChange={(e) => setFormData({...formData, hasBusinessPermit: e.target.value})}
                >
                  <option value="yes">Yes, I have it</option>
                  <option value="no">No, currently processing</option>
                  <option value="none">I am a private homeowner</option>
                </select>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Additional Information</h3>
            <div style={styles.group}>
              <label style={styles.label}>Management Experience</label>
              <textarea 
                style={styles.textarea} 
                placeholder="How long have you been managing boarding houses?"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                required
              />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Why do you want to join BoardMate?</label>
              <textarea 
                style={styles.textarea} 
                placeholder="Tell us your goals..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={styles.actions}>
            <button 
              type="button" 
              onClick={() => navigate("/dashboard")}
              style={{ ...styles.button, background: "#6b7280" }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={styles.button}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    fontFamily: "Segoe UI, sans-serif"
  },
  formCard: {
    background: "white",
    width: "100%",
    maxWidth: "800px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    padding: "40px",
    boxSizing: "border-box"
  },
  header: {
    textAlign: "center",
    marginBottom: "40px"
  },
  title: {
    fontSize: "28px",
    color: "#1e3a8a",
    margin: "0 0 10px 0"
  },
  subtitle: {
    color: "#6b7280",
    margin: 0
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "30px"
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  sectionTitle: {
    fontSize: "18px",
    color: "#111827",
    margin: "0 0 5px 0",
    paddingBottom: "10px",
    borderBottom: "2px solid #f3f4f6"
  },
  row: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap"
  },
  group: {
    flex: 1,
    minWidth: "250px",
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151"
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none"
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    minHeight: "100px",
    fontFamily: "inherit",
    outline: "none"
  },
  actions: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
    marginTop: "20px"
  },
  button: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    color: "white",
    background: "#1e3a8a",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer"
  }
};

export default OwnerApplication;
