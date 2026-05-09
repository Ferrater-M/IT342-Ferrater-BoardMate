import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    fontSize: "14px",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  popup: {
    background: "white",
    border: "1px solid #ddd",
    padding: "25px",
    borderRadius: "12px",
    width: "320px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  }
};

const ManageRooms = () => {
  const { houseId } = useParams();
  const navigate = useNavigate();
  const userName = localStorage.getItem("name") || "Owner";
  const [house, setHouse] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [roomFormData, setRoomFormData] = useState({
    roomNumber: "",
    type: "Single",
    price: "",
    inclusions: "",
    status: "Available",
    paymentStatus: "Not Paid",
    billingMonth: new Date().toISOString().split('T')[0],
  });

  const [openBillId, setOpenBillId] = useState(null);
  const [billDraft, setBillDraft] = useState({ price: "", inclusions: "", billingMonth: "" });
  const [necessityItems, setNecessityItems] = useState([]); // Array of { name, price }
  const [roomReceipts, setRoomReceipts] = useState({}); // { roomId: [receipts] }
  const [viewingReceiptsRoomId, setViewingReceiptsRoomId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    // If it's already YYYY-MM-DD, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    
    // Otherwise try to parse it (handles "Month Year" or other formats)
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchHouseAndRooms();
    fetchStudents();
  }, [houseId]);

  // Parse inclusions string "Name:Price,Name:Price" into array
  const parseInclusions = (str) => {
    if (!str) return [];
    return str.split(",").map(item => {
      const [name, price] = item.split(":");
      return { name: name?.trim() || "", price: price?.trim() || "0" };
    }).filter(item => item.name);
  };

  // Convert array back to string
  const serializeInclusions = (items) => {
    return items
      .filter(item => item.name)
      .map(item => `${item.name}:${item.price || "0"}`)
      .join(",");
  };

  const addNecessityRow = () => {
    setNecessityItems([...necessityItems, { name: "", price: "" }]);
  };

  const removeNecessityRow = (index) => {
    setNecessityItems(necessityItems.filter((_, i) => i !== index));
  };

  const updateNecessityRow = (index, field, value) => {
    const newItems = [...necessityItems];
    newItems[index][field] = value;
    setNecessityItems(newItems);
  };

  const fetchHouseAndRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/houses/${houseId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setHouse(data);
      const roomData = data.rooms || [];
      setRooms(roomData);
      
      // Fetch receipts for all rooms
      roomData.forEach(r => fetchReceiptsForRoom(r.id));
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching house/rooms:", err);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/houses/users/students", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchReceiptsForRoom = async (roomId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/houses/rooms/${roomId}/receipts`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRoomReceipts(prev => ({ ...prev, [roomId]: data }));
      }
    } catch (err) {
      console.error("Error fetching receipts:", err);
    }
  };

  const generateReceiptForRoom = async (room) => {
    if (room.paymentStatus !== "Paid") {
      alert("Cannot generate receipt for unpaid rooms.");
      return;
    }

    if (!room.occupant && !room.occupantName) {
      alert("No occupant assigned to this room. Cannot generate receipt.");
      return;
    }

    const existingReceipts = roomReceipts[room.id] || [];
    const alreadyHasReceipt = existingReceipts.some(rec => 
      formatDateForInput(rec.billingDate) === formatDateForInput(room.billingMonth)
    );

    if (alreadyHasReceipt) {
      if (!window.confirm(`A receipt for ${formatDateForInput(room.billingMonth)} already exists. Generate another one?`)) {
        return;
      }
    }

    const total = parseInt((room.price || "0").replace(/[^0-9]/g, "")) + 
                  parseInclusions(room.inclusions).reduce((sum, item) => sum + parseInt((item.price || "0").replace(/[^0-9]/g, "")), 0);
    
    const receiptPayload = {
      roomNumber: room.roomNumber,
      billingDate: room.billingMonth,
      price: room.price,
      inclusions: room.inclusions,
      totalAmount: `₱${total.toLocaleString()}`,
      paymentStatus: "Paid"
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/houses/rooms/${room.id}/receipts`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(receiptPayload),
      });

      if (res.ok) {
        fetchReceiptsForRoom(room.id);
        alert(`Receipt successfully generated for ${formatDateForInput(room.billingMonth)}!`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to generate receipt: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.error("Error generating receipt:", err);
      alert("An error occurred while generating the receipt.");
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/houses/${houseId}/rooms`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(roomFormData),
      });
      if (res.ok) {
        const newRoom = await res.json();
        setRooms([...rooms, newRoom]);
        setRoomFormData({
          roomNumber: "",
          type: "Single",
          price: "",
          inclusions: "",
          status: "Available",
          paymentStatus: "Not Paid",
          billingMonth: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error("Error adding room:", err);
    }
  };

  const handleUpdateRoom = async (roomId, updates) => {
    console.log("Updating room:", roomId, "with payload:", updates);
    const token = localStorage.getItem("token");
    const payload = {
      ...updates,
      occupant: updates.occupant && updates.occupant.id ? { id: updates.occupant.id } : null
    };

    try {
      const res = await fetch(`/api/houses/rooms/${roomId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updatedRoom = await res.json();
        setRooms(rooms.map(r => r.id === roomId ? updatedRoom : r));
        return true; // Indicate success
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to update room: ${errorData.message || res.statusText}`);
        return false;
      }
    } catch (err) {
      console.error("Error updating room:", err);
      return false;
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`/api/houses/rooms/${roomId}`, { 
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setRooms(rooms.filter(r => r.id !== roomId));
        }
      } catch (err) {
        console.error("Error deleting room:", err);
      }
    }
  };

  if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>Loading...</div>;

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <h2>BoardMate Owner</h2>
        <div style={styles.sideMenu}>
          <span onClick={() => navigate("/owner-dashboard")} style={{ cursor: "pointer" }}>Manage Houses</span>
          <span style={{ cursor: "pointer", fontWeight: "bold" }}>Manage Rooms</span>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.nav}>
          <div style={{ fontWeight: "bold", color: "#1e3a8a" }}>Manage Rooms for {house?.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>{userName}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>Property Owner</div>
            </div>
            <span style={{ color: "red", cursor: "pointer", fontSize: "14px" }} onClick={() => navigate("/login")}>Logout</span>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.header}>
            <h1>Room Management</h1>
            <button style={styles.addBtn} onClick={() => navigate("/owner-dashboard")}>← Back to Houses</button>
          </div>

          <form onSubmit={handleAddRoom} style={{ background: "white", padding: "25px", borderRadius: "12px", marginBottom: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <h4 style={{ marginTop: 0, marginBottom: "20px" }}>Add New Room</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "20px", alignItems: "flex-end" }}>
              <div>
                <label style={{ ...styles.label, fontSize: "12px" }}>Room #</label>
                <input style={styles.input} placeholder="e.g. 101" value={roomFormData.roomNumber} onChange={e => setRoomFormData({...roomFormData, roomNumber: e.target.value})} required />
              </div>
              <div>
                <label style={{ ...styles.label, fontSize: "12px" }}>Type</label>
                <select style={styles.input} value={roomFormData.type} onChange={e => setRoomFormData({...roomFormData, type: e.target.value})}>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>
              <div>
                <label style={{ ...styles.label, fontSize: "12px" }}>Rent Price</label>
                <input style={styles.input} placeholder="e.g. 2000" value={roomFormData.price} onChange={e => setRoomFormData({...roomFormData, price: e.target.value})} required />
              </div>
              <div>
                <label style={{ ...styles.label, fontSize: "12px" }}>Status</label>
                <select style={styles.input} value={roomFormData.status} onChange={e => setRoomFormData({...roomFormData, status: e.target.value})}>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>
              <div>
                <label style={{ ...styles.label, fontSize: "12px" }}>Billing Month</label>
                <input 
                  type="date"
                  style={styles.input} 
                  value={roomFormData.billingMonth} 
                  onChange={e => setRoomFormData({...roomFormData, billingMonth: e.target.value})}
                />
              </div>
              <button type="submit" style={{ ...styles.addBtn, height: "42px" }}>Add Room</button>
            </div>
          </form>

          <div style={{ overflowX: "auto" }}>
            <table style={{ ...styles.table, minWidth: "1100px" }}>
              <thead>
                <tr style={{ display: "grid", gridTemplateColumns: "80px 100px 100px 120px 120px 1fr 120px 100px 100px" }}>
                  <th style={styles.th}>Room #</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>BILLS</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Occupant</th>
                  <th style={styles.th}>NECESSITIES</th>
                  <th style={styles.th}>Receipts</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id} style={{ display: "grid", gridTemplateColumns: "80px 100px 100px 120px 120px 1fr 120px 100px 100px", borderBottom: "1px solid #eee", position: "relative" }}>
                    <td style={styles.td}>{r.roomNumber}</td>
                    <td style={styles.td}>{r.type}</td>
                    <td style={{ ...styles.td, position: "relative" }}>
                      <button onClick={() => { 
                        setOpenBillId(r.id); 
                        setBillDraft({ 
                          price: r.price, 
                          inclusions: r.inclusions || "",
                          billingMonth: formatDateForInput(r.billingMonth)
                        }); 
                        setNecessityItems(parseInclusions(r.inclusions));
                      }} style={{ ...styles.actionBtn, background: "#1e3a8a", color: "white" }}>Edit Bills</button>
                      
                      {openBillId === r.id && (
                        <div style={styles.popupOverlay}>
                          <div style={{ ...styles.popup, width: "400px" }}>
                            <h4 style={{ margin: "0 0 20px 0", fontSize: "18px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Edit Bills (Room {r.roomNumber})</h4>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                              <div>
                                <label style={{ display: "block", marginBottom: "5px", fontSize: "11px", fontWeight: "600", color: "#666" }}>Rent Price</label>
                                <input style={{ ...styles.input, padding: "8px" }} value={billDraft.price} onChange={e => setBillDraft({ ...billDraft, price: e.target.value })} />
                              </div>
                              <div>
                                <label style={{ display: "block", marginBottom: "5px", fontSize: "11px", fontWeight: "600", color: "#666" }}>Billing Date</label>
                                <input 
                                  type="date"
                                  style={{ ...styles.input, padding: "8px" }} 
                                  value={billDraft.billingMonth} 
                                  onChange={e => setBillDraft({ ...billDraft, billingMonth: e.target.value })} 
                                />
                              </div>
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                <label style={{ fontSize: "13px", fontWeight: "700", color: "#1e3a8a" }}>NECESSITIES</label>
                                <button onClick={addNecessityRow} style={{ ...styles.actionBtn, background: "#10b981", color: "white", margin: 0 }}>+ Add</button>
                              </div>
                              
                              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #eee", borderRadius: "6px", padding: "10px" }}>
                                {necessityItems.length === 0 && <div style={{ textAlign: "center", color: "#999", fontSize: "12px", padding: "10px" }}>No necessities added</div>}
                                {necessityItems.map((item, idx) => (
                                  <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                                    <input 
                                      placeholder="Name (e.g. Parking)" 
                                      style={{ ...styles.input, flex: 2, padding: "6px", fontSize: "12px" }} 
                                      value={item.name} 
                                      onChange={e => updateNecessityRow(idx, "name", e.target.value)}
                                    />
                                    <input 
                                      placeholder="Price" 
                                      style={{ ...styles.input, flex: 1, padding: "6px", fontSize: "12px" }} 
                                      value={item.price} 
                                      onChange={e => updateNecessityRow(idx, "price", e.target.value)}
                                    />
                                    <button 
                                      onClick={() => removeNecessityRow(idx)} 
                                      style={{ ...styles.actionBtn, background: "#ef4444", color: "white", padding: "4px 8px", margin: 0 }}
                                    >✕</button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                              <button 
                                style={{ ...styles.actionBtn, background: "#1e3a8a", color: "white", flex: 1, padding: "12px", fontSize: "14px" }} 
                                onClick={async () => { 
                                  const finalInclusions = serializeInclusions(necessityItems);
                                  const success = await handleUpdateRoom(r.id, { ...r, ...billDraft, inclusions: finalInclusions }); 
                                  
                                  if (success) {
                                    alert(`Billing updated for ${billDraft.billingMonth}!`);
                                    setOpenBillId(null); 
                                  }
                                }}
                              >Save All Changes</button>
                              <button 
                                style={{ ...styles.actionBtn, background: "#6b7280", color: "white", flex: 1, padding: "12px", fontSize: "14px" }} 
                                onClick={() => setOpenBillId(null)}
                              >Cancel</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <select style={{ ...styles.input, padding: "6px" }} value={r.status} onChange={e => {
                        const newStatus = e.target.value;
                        handleUpdateRoom(r.id, { ...r, status: newStatus, occupant: newStatus === "Available" ? null : r.occupant });
                      }}>
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <select 
                        style={{ 
                          ...styles.input, 
                          padding: "6px", 
                          background: r.paymentStatus === "Paid" ? "#ecfdf5" : "#fef2f2",
                          color: r.paymentStatus === "Paid" ? "#059669" : "#dc2626",
                          fontWeight: "bold"
                        }} 
                        value={r.paymentStatus || "Not Paid"} 
                        onChange={async (e) => { 
                          const newStatus = e.target.value;
                          const success = await handleUpdateRoom(r.id, { ...r, paymentStatus: newStatus });
                          
                          if (success && newStatus === "Paid") {
                            const existingReceipts = roomReceipts[r.id] || [];
                            const alreadyHasReceipt = existingReceipts.some(rec => 
                              formatDateForInput(rec.billingDate) === formatDateForInput(r.billingMonth)
                            );

                            if (!alreadyHasReceipt) {
                              await generateReceiptForRoom({ ...r, paymentStatus: newStatus });
                            }
                          }
                        }}
                      >
                        <option value="Not Paid">Not Paid</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <select style={{ ...styles.input, padding: "6px", width: "95%" }} value={r.occupant?.id || ""} onChange={e => {
                        const student = students.find(s => s.id.toString() === e.target.value);
                        handleUpdateRoom(r.id, { ...r, status: student ? "Occupied" : "Available", occupant: student ? { id: student.id } : null, occupantName: student ? `${student.firstName} ${student.lastName}` : "" });
                      }}>
                        <option value="">Select Student...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                      </select>
                    </td>
                    <td style={{ ...styles.td, position: "relative" }}>
                      <div style={{ fontSize: "12px", color: "#666", maxWidth: "150px" }}>
                        {parseInclusions(r.inclusions).map((item, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>{item.name}</span>
                            <span>₱{item.price}</span>
                          </div>
                        ))}
                        {!r.inclusions && "—"}
                      </div>
                    </td>
                    <td style={{ ...styles.td, position: "relative" }}>
                      <div style={{ fontSize: "11px", color: "#666", marginBottom: "5px" }}>
                        {(roomReceipts[r.id] || []).length} generated
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {r.paymentStatus === "Paid" && (
                          <button 
                            onClick={() => generateReceiptForRoom(r)}
                            style={{ ...styles.actionBtn, background: "#10b981", color: "white", fontSize: "10px", padding: "4px 8px", margin: 0 }}
                          >
                            +
                          </button>
                        )}
                        {(roomReceipts[r.id] || []).length > 0 && (
                          <button 
                            onClick={() => setViewingReceiptsRoomId(r.id)}
                            style={{ ...styles.actionBtn, background: "#1e3a8a", color: "white", fontSize: "10px", padding: "4px 8px", margin: 0 }}
                          >
                            View
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <button style={{ ...styles.actionBtn, background: "#ef4444", color: "white" }} onClick={() => handleDeleteRoom(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RECEIPT LIST MODAL */}
      {viewingReceiptsRoomId && (
        <div style={styles.popupOverlay}>
          <div style={{ ...styles.popup, width: "500px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #1e3a8a", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, color: "#1e3a8a" }}>Receipt History - Room {rooms.find(r => r.id === viewingReceiptsRoomId)?.roomNumber}</h3>
              <button onClick={() => setViewingReceiptsRoomId(null)} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(roomReceipts[viewingReceiptsRoomId] || []).map((rec, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedReceipt(rec)}
                  style={{ 
                    padding: "15px", 
                    border: "1px solid #eee", 
                    borderRadius: "8px", 
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#f9fafb"}
                  onMouseOut={e => e.currentTarget.style.background = "white"}
                >
                  <div>
                    <div style={{ fontWeight: "bold", color: "#333" }}>{formatDateForInput(rec.billingDate)}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>Total: {rec.totalAmount}</div>
                  </div>
                  <div style={{ color: "#10b981", fontWeight: "bold", fontSize: "12px" }}>PAID</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAILED RECEIPT MODAL */}
      {selectedReceipt && (
        <div style={{ ...styles.popupOverlay, zIndex: 3000 }}>
          <div style={{ ...styles.popup, width: "400px", padding: "40px", position: "relative", fontFamily: "'Courier New', Courier, monospace" }}>
            <button 
              onClick={() => setSelectedReceipt(null)} 
              style={{ position: "absolute", top: "15px", right: "15px", border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}
            >✕</button>
            
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ margin: "0 0 5px 0", color: "#1e3a8a" }}>BOARDMATE</h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Official Payment Receipt</p>
            </div>

            <div style={{ borderTop: "1px dashed #ccc", borderBottom: "1px dashed #ccc", padding: "15px 0", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                <span>Date:</span>
                <span style={{ fontWeight: "bold" }}>{formatDateForInput(selectedReceipt.billingDate)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                <span>Room No:</span>
                <span style={{ fontWeight: "bold" }}>{selectedReceipt.roomNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span>Status:</span>
                <span style={{ fontWeight: "bold", color: "#10b981" }}>PAID</span>
              </div>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontWeight: "bold", borderBottom: "1px solid #eee", pb: "5px" }}>
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                <span>Monthly Rent</span>
                <span>₱{selectedReceipt.price}</span>
              </div>
              {parseInclusions(selectedReceipt.inclusions).map((inc, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span>{inc.name}</span>
                  <span>₱{inc.price}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #1e3a8a", paddingTop: "15px", fontWeight: "bold", fontSize: "18px", color: "#1e3a8a" }}>
              <span>TOTAL</span>
              <span>{selectedReceipt.totalAmount}</span>
            </div>

            <div style={{ textAlign: "center", marginTop: "40px", fontSize: "11px", color: "#999" }}>
              <p>Thank you for your payment!</p>
              <p>Generated on {new Date().toLocaleDateString()}</p>
            </div>

            <button 
              onClick={() => window.print()} 
              style={{ ...styles.addBtn, width: "100%", marginTop: "20px", background: "#6b7280" }}
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
