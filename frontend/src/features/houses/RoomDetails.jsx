import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import "../../shared/styles/Nav.css";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePicture") || "");
  const [newPicUrl, setNewPicUrl] = useState("");
  const [isUpdatingPic, setIsUpdatingPic] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitData, setVisitData] = useState({ dateTime: "", message: "" });
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [userRole] = useState(localStorage.getItem("role") || "ROLE_USER");

  const currentUserId = localStorage.getItem("userId");
  const currentUserName = localStorage.getItem("name") || "User";

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "ROLE_ADMIN") {
      navigate("/owner-dashboard");
      return;
    } else if (role === "ROLE_SUPERADMIN") {
      navigate("/admin");
      return;
    }

    fetch(`/api/houses/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setHouse(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error:", err);
        setLoading(false);
      });

    // Fetch user's specific rating for this house
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`/api/houses/${id}/my-rating`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (typeof data === 'number') {
            setUserRating(data);
          }
        })
        .catch(err => console.error("Error fetching user rating:", err));
    }
  }, [id]);

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

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingVisit(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/visits/request", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          houseId: id,
          dateTime: visitData.dateTime,
          message: visitData.message
        })
      });

      if (res.ok) {
        alert("Visit request submitted! The owner will review your request.");
        setShowVisitModal(false);
        setVisitData({ dateTime: "", message: "" });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit request");
      }
    } catch (err) {
      console.error("Error submitting visit request:", err);
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  const nextImage = (total) => setCurrentImageIndex((currentImageIndex + 1) % total);
  const prevImage = (total) => setCurrentImageIndex((currentImageIndex - 1 + total) % total);

  const handleRate = async (score) => {
    setIsSubmittingRating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/houses/${id}/rate?score=${score}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setUserRating(score);
        // Refresh house data to get new average rating
        const freshRes = await fetch(`/api/houses/${id}`);
        const freshData = await freshRes.json();
        setHouse(freshData);
        alert("Thank you for your rating!");
      }
    } catch (err) {
      console.error("Error rating:", err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const openBillingModal = (room) => {
    setSelectedRoom(room);
    setShowBillingModal(true);
    fetchReceipts(room.id);
  };

  const fetchReceipts = async (roomId) => {
    try {
      const res = await fetch(`/api/houses/rooms/${roomId}/receipts`);
      if (res.ok) {
        const data = await res.json();
        setReceipts(data.sort((a, b) => new Date(b.billingDate) - new Date(a.billingDate)));
      }
    } catch (err) {
      console.error("Error fetching receipts:", err);
    }
  };

  const parseInclusions = (str) => {
    if (!str) return [];
    return str.split(",").map(item => {
      const [name, price] = item.split(":");
      return { name: name?.trim() || "", price: price?.trim() || "0" };
    }).filter(item => item.name);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    
    // If it's already a formatted string with spaces, return it
    if (dateStr.includes(" ") && !dateStr.includes("-")) return dateStr;
    
    // Parse YYYY-MM-DD correctly without timezone shifts
    const [year, month, day] = dateStr.split('-').map(Number);
    if (year && month && day) {
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!house) return <p style={{ padding: 20 }}>House not found</p>;

  const currentImages = house.imageUrls && house.imageUrls.length > 0 ? house.imageUrls : [house.imageUrl];

  return (
    <div style={styles.layout}>
      {/* LEFT SIDEBAR - BRANDING ONLY */}
      <div style={styles.sidebar}>
        <h2>BoardMate</h2>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.main}>
        {/* TOP NAV */}
        <div style={styles.nav}>
          {/* LEFT: LOGO */}
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div onClick={() => navigate("/dashboard")} style={{ ...styles.logoText, cursor: "pointer", fontWeight: "600", color: "#1e3a8a", fontSize: "18px" }}>
              BoardMate
            </div>
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
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>{currentUserName}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {userRole === "ROLE_USER" ? "Boarder" : userRole === "ROLE_ADMIN" ? "Owner" : "Admin"}
              </div>
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
                <span style={{ fontSize: "20px", color: "#1e3a8a", fontWeight: "bold" }}>{currentUserName.charAt(0)}</span>
              )}
            </div>
            <span style={{ color: "red", cursor: "pointer", fontSize: "14px" }} onClick={handleLogout}>Logout</span>
          </div>
        </div>

        <div style={styles.content}>
          {/* BREADCRUMB */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <p style={{ margin: 0, color: "#666" }}>
          <span onClick={() => navigate("/rooms")} style={styles.link}>
            Boarding Houses
          </span>
          {" > "}
          <b>{house.name}</b>
        </p>
        <button onClick={() => navigate(-1)} style={{ ...styles.pill, cursor: "pointer", border: "1px solid #ddd" }}>
          ← Back
        </button>
      </div>

      {/* HEADER CARD */}
      <div style={styles.headerCard}>

        <div style={styles.imageContainer}>
          <img
            src={currentImages[currentImageIndex]}
            alt={house.name}
            style={styles.image}
          />
          {currentImages.length > 1 && (
            <>
              <button 
                style={{ ...styles.carouselBtn, left: "10px" }}
                onClick={() => prevImage(currentImages.length)}
              >
                ‹
              </button>
              <button 
                style={{ ...styles.carouselBtn, right: "10px" }}
                onClick={() => nextImage(currentImages.length)}
              >
                ›
              </button>
            </>
          )}
        </div>

        <div style={styles.headerInfo}>

          <h1 style={{ margin: 0 }}>{house.name}</h1>

          <p style={styles.meta}>
            📍 {house.location} • ⭐ {house.rating} Rating
          </p>

          <div style={{ margin: "15px 0", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Rate this house:</span>
            <div style={{ display: "flex", gap: "5px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star}
                  onClick={() => !isSubmittingRating && handleRate(star)}
                  style={{ 
                    cursor: isSubmittingRating ? "default" : "pointer", 
                    fontSize: "20px", 
                    color: star <= (userRating || 0) ? "#fbbf24" : "#d1d5db",
                    transition: "transform 0.1s"
                  }}
                  onMouseOver={(e) => !isSubmittingRating && (e.currentTarget.style.transform = "scale(1.2)")}
                  onMouseOut={(e) => !isSubmittingRating && (e.currentTarget.style.transform = "scale(1)")}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <p style={styles.meta}>
            💰 {house.price} • 🏠 {house.roomsLeft} rooms available
          </p>

          <p style={{ color: "#666" }}>{house.description}</p>

          {/* DYNAMIC AMENITIES FROM INCLUSIONS */}
          <div style={styles.pills}>
            {house.rooms && house.rooms.length > 0 && 
              [...new Set(house.rooms.flatMap(r => parseInclusions(r.inclusions).map(i => i.name)))]
              .map((amenity, idx) => (
                <span key={idx} style={styles.pill}>* {amenity}</span>
              ))
            }
            {(!house.rooms || house.rooms.length === 0) && (
              <>
                <span style={styles.pill}>* Wi-Fi</span>
                <span style={styles.pill}>* Water Included</span>
                <span style={styles.pill}>* 24/7 Security</span>
              </>
            )}
          </div>

          <button 
            style={styles.button}
            onClick={() => setShowVisitModal(true)}
          >
            Request a Visit
          </button>

        </div>
      </div>

      {/* ROOMS SECTION */}
      <div style={styles.sectionHeader}>
        <h2>Rooms</h2>
        <p>{house.rooms ? house.rooms.length : 0} rooms • {house.roomsLeft} available</p>
      </div>

      {/* TABLE */}
      <div style={styles.table}>

        <div style={styles.rowHeader}>
          <span>ROOM</span>
          <span>TYPE</span>
          <span>MONTHLY RENT</span>
          <span>INCLUSIONS</span>
          <span>STATUS</span>
          <span>ACTION</span>
        </div>

        {/* DYNAMIC ROOM ROWS */}
        {house.rooms && house.rooms.map((room) => {
          // Check if user is the occupant by ID or by Name (fallback)
          const isOccupant = (room.occupant && room.occupant.id?.toString() === currentUserId) || 
                            (room.occupantName === currentUserName && currentUserName);
          
          const displayStatus = (room.status === 'Occupied' || room.status === 'Your Room') 
            ? 'Occupied' 
            : room.status;

          return (
            <div key={room.id} style={styles.row}>
              <span>{room.roomNumber}</span>
              <span>{room.type}</span>
              <span>{room.price}</span>
              <span>
                {parseInclusions(room.inclusions).map(i => i.name).join(", ") || room.inclusions || "-"}
              </span>
              <span style={
                displayStatus === 'Available' ? styles.available : styles.occupied
              }>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  {displayStatus}
                  {isOccupant && <FiHeart style={{ color: "#ef4444" }} title="Your Room" />}
                </div>
              </span>
              <span>
                 {isOccupant ? (
                   <span 
                     onClick={() => openBillingModal(room)} 
                     style={{ color: "#1e3a8a", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}
                   >
                     View Billing →
                   </span>
                 ) : '-'}
              </span>
            </div>
          );
        })}

        {(!house.rooms || house.rooms.length === 0) && (
          <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            No room details listed for this boarding house.
          </p>
        )}

      </div>

      </div>

      {/* VISIT REQUEST MODAL */}
      {showVisitModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ borderBottom: "2px solid #1e3a8a", paddingBottom: "10px", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#1e3a8a" }}>📅 Request a Visit</h2>
              <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>Schedule a tour for <strong>{house.name}</strong></p>
            </div>
            
            <form onSubmit={handleVisitSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Preferred Date & Time</label>
                <input 
                  type="datetime-local"
                  style={styles.input} 
                  value={visitData.dateTime}
                  onChange={(e) => setVisitData({ ...visitData, dateTime: e.target.value })}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Message to Owner (Optional)</label>
                <textarea 
                  style={{ ...styles.input, height: "100px", fontFamily: "inherit" }}
                  placeholder="e.g. I'm interested in the single room. Can I visit this weekend?"
                  value={visitData.message}
                  onChange={(e) => setVisitData({ ...visitData, message: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button 
                  type="submit" 
                  disabled={isSubmittingVisit}
                  style={{ ...styles.addBtn, flex: 1, background: "#1e3a8a" }}
                >
                  {isSubmittingVisit ? "Submitting..." : "Submit Request"}
                </button>
                <button 
                  type="button" 
                  style={{ ...styles.addBtn, flex: 1, background: "#6b7280" }} 
                  onClick={() => setShowVisitModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BILLING MODAL */}
      {showBillingModal && selectedRoom && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>Monthly Billing</h2>
              <button onClick={() => setShowBillingModal(false)} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>×</button>
            </div>
            
            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={styles.billingItem}>
                <span>Room Number:</span>
                <span style={{ fontWeight: "bold" }}>{selectedRoom.roomNumber}</span>
              </div>
              <div style={styles.billingItem}>
                <span>Room Type:</span>
                <span>{selectedRoom.type}</span>
              </div>
              <div style={styles.billingItem}>
                <span>Monthly Rent:</span>
                <span style={{ color: "#1e3a8a", fontWeight: "bold" }}>{selectedRoom.price}</span>
              </div>
              
              {parseInclusions(selectedRoom.inclusions).length > 0 && (
                <>
                  <div style={{ borderTop: "1px dashed #e2e8f0", margin: "10px 0" }}></div>
                  <div style={{ marginBottom: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Other Necessities:</span>
                  </div>
                  {parseInclusions(selectedRoom.inclusions).map((item, i) => (
                    <div key={i} style={styles.billingItem}>
                      <span>{item.name}:</span>
                      <span style={{ color: "#1e3a8a" }}>₱{item.price}</span>
                    </div>
                  ))}
                </>
              )}

              <div style={styles.billingItem}>
                <span>Billing Date:</span>
                <span style={{ fontWeight: "600" }}>{formatDate(selectedRoom.billingMonth)}</span>
              </div>
              
              <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "15px 0" }} />
              <div style={styles.billingItem}>
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Total Amount:</span>
                <span style={{ color: "#1e3a8a", fontWeight: "bold", fontSize: "16px" }}>
                  ₱{(
                    parseInt((selectedRoom.price || "0").replace(/[^0-9]/g, "")) + 
                    parseInclusions(selectedRoom.inclusions).reduce((sum, item) => sum + parseInt((item.price || "0").replace(/[^0-9]/g, "")), 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div style={styles.billingItem}>
                <span style={{ fontWeight: "bold" }}>Status:</span>
                <span style={{ 
                  color: selectedRoom.paymentStatus === "Paid" ? "#059669" : "#dc2626", 
                  fontWeight: "bold", 
                  background: selectedRoom.paymentStatus === "Paid" ? "#ecfdf5" : "#fef2f2", 
                  padding: "4px 10px", 
                  borderRadius: "20px", 
                  fontSize: "12px" 
                }}>
                  {selectedRoom.paymentStatus?.toUpperCase() || "NOT PAID"}
                </span>
              </div>
            </div>

            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "20px", textAlign: "center" }}>
              For questions about your billing, please contact the boarding house owner.
            </p>

            <button 
              onClick={() => setShowBillingModal(false)} 
              style={{ ...styles.button, width: "100%", marginTop: "10px" }}
            >
              Close
            </button>

            {receipts.length > 0 && (
              <div style={{ marginTop: "25px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                <h3 style={{ fontSize: "14px", margin: "0 0 15px 0", color: "#1e3a8a" }}>PREVIOUS RECEIPTS</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {receipts.map(receipt => (
                    <div 
                      key={receipt.id} 
                      onClick={() => setSelectedReceipt(receipt)}
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        padding: "10px", 
                        background: "#f8fafc", 
                        borderRadius: "8px", 
                        cursor: "pointer",
                        border: "1px solid #e2e8f0",
                        fontSize: "13px"
                      }}
                    >
                      <span>{formatDate(receipt.billingDate)}</span>
                      <span style={{ fontWeight: "600", color: "#1e3a8a" }}>{receipt.totalAmount} →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OFFICIAL RECEIPT POPUP */}
      {selectedReceipt && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, width: "450px", padding: "40px", position: "relative" }}>
            <button 
              onClick={() => setSelectedReceipt(null)} 
              style={{ position: "absolute", top: "20px", right: "20px", border: "none", background: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8" }}
            >
              ×
            </button>
            
            <div id="receipt-content" style={{ textAlign: "center", fontFamily: "Courier New, monospace" }}>
              <h1 style={{ margin: "0 0 5px 0", fontSize: "24px", letterSpacing: "2px" }}>BOARDMATE</h1>
              <p style={{ margin: "0 0 20px 0", fontSize: "12px", color: "#64748b" }}>Official Payment Receipt</p>
              
              <div style={{ borderTop: "2px dashed #000", borderBottom: "2px dashed #000", padding: "15px 0", margin: "20px 0", textAlign: "left" }}>
                <div style={styles.receiptLine}>
                  <span>Receipt #:</span>
                  <span>{selectedReceipt.id.toString().padStart(6, '0')}</span>
                </div>
                <div style={styles.receiptLine}>
                  <span>Date:</span>
                  <span>{new Date(selectedReceipt.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={styles.receiptLine}>
                  <span>Room:</span>
                  <span>{selectedReceipt.roomNumber}</span>
                </div>
                <div style={styles.receiptLine}>
                  <span>Billing Period:</span>
                  <span>{formatDate(selectedReceipt.billingDate)}</span>
                </div>
              </div>

              <div style={{ textAlign: "left", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "bold" }}>
                  <span>DESCRIPTION</span>
                  <span>AMOUNT</span>
                </div>
                <div style={styles.receiptLine}>
                  <span>Monthly Rent</span>
                  <span>{selectedReceipt.price}</span>
                </div>
                {parseInclusions(selectedReceipt.inclusions).map((item, idx) => (
                  <div key={idx} style={styles.receiptLine}>
                    <span>{item.name}</span>
                    <span>₱{item.price}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #000", paddingTop: "10px", textAlign: "right" }}>
                <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>
                  TOTAL: {selectedReceipt.totalAmount}
                </p>
                <p style={{ fontSize: "12px", color: "#059669", fontWeight: "bold", margin: "5px 0" }}>
                  STATUS: PAID
                </p>
              </div>

              <div style={{ marginTop: "40px", fontSize: "11px", color: "#64748b" }}>
                <p>Thank you for your payment!</p>
                <p>This is a system-generated receipt for {house.name}.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
              <button 
                onClick={() => window.print()} 
                style={{ ...styles.button, flex: 1, background: "#64748b" }}
              >
                Print Receipt
              </button>
              <button 
                onClick={() => setSelectedReceipt(null)} 
                style={{ ...styles.button, flex: 1 }}
              >
                Close
              </button>
            </div>
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
                  <span style={{ fontSize: "48px", color: "#1e3a8a", fontWeight: "bold" }}>{currentUserName.charAt(0)}</span>
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
              <h2 style={{ color: "#1e3a8a", margin: "0 0 5px 0", fontSize: "22px" }}>{currentUserName}</h2>
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
    position: "sticky",
    top: 0,
    zIndex: 100,
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

  breadcrumb: {
    marginBottom: "15px",
    color: "#666",
  },

  link: {
    color: "#1e3a8a",
    cursor: "pointer",
  },

  headerCard: {
    display: "flex",
    gap: "30px",
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    marginBottom: "20px",
    alignItems: "flex-start",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },

  imageContainer: {
    position: "relative",
    width: "300px",
    height: "200px",
    borderRadius: "12px",
    overflow: "hidden",
    background: "#eee",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  carouselBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.5)",
    color: "white",
    border: "none",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  headerInfo: {
    flex: 1,
  },

  meta: {
    color: "#666",
    fontSize: "15px",
    margin: "8px 0",
  },

  pills: {
    display: "flex",
    gap: "10px",
    margin: "20px 0",
    flexWrap: "wrap",
  },

  pill: {
    background: "#f0f2f5",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#444",
  },

  button: {
    background: "#1e3a8a",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    margin: "40px 0 15px 0",
  },

  table: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },

  rowHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1.5fr 1fr 1fr",
    padding: "15px 20px",
    background: "#f8fafc",
    borderBottom: "1px solid #eee",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1.5fr 1fr 1fr",
    padding: "18px 20px",
    borderBottom: "1px solid #f1f5f9",
    alignItems: "center",
    fontSize: "14px",
    color: "#334155",
  },

  available: {
    color: "#059669",
    background: "#ecfdf5",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    width: "fit-content",
  },

  occupied: {
    color: "#64748b",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    width: "fit-content",
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
    borderRadius: "20px",
    width: "400px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  formGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },

  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  addBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },

  billingItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontSize: "14px",
    color: "#475569",
  },

  receiptLine: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
    fontSize: "13px",
  },
};

export default RoomDetails;