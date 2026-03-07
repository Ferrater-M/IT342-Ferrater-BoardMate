import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("ROLE_USER");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }
            navigate("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                height: "90vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "Segoe UI, sans-serif",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    width: "1100px",
                    height: "620px",
                    display: "flex",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                    background: "white",
                }}
            >
                {/* LEFT SIDE */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundImage: "url('/bh1.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        color: "white",
                        padding: "40px",
                    }}
                >
                    <div style={{ textAlign: "center", maxWidth: "400px" }}>
                        <h1 style={{ fontSize: "3rem", fontWeight: "800", letterSpacing: "-1px", marginBottom: "10px" }}>
                            <span style={{ color: "#ffffff" }}>Board</span>
                            <span style={{ color: "#2dd4bf" }}>Mate</span>
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", marginBottom: "25px" }}>
                            Join thousands of happy boarders
                        </p>
                        <p style={{ opacity: 0.8, lineHeight: "1.7" }}>
                            Create your account and start finding the perfect boarding house today.
                            Owners can also sign up to list their properties.
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "40px",
                        background: "#ffffff",
                    }}
                >
                    <div style={{ width: "100%", maxWidth: "360px" }}>
                        <h2 style={{ fontSize: "1.9rem", fontWeight: "700", marginBottom: "5px" }}>Create Account</h2>
                        <p style={{ color: "#6b7280", marginBottom: "30px" }}>Sign up to get started with BoardMate</p>

                        {error && (
                            <div
                                style={{
                                    background: "#fee2e2",
                                    border: "1px solid #fca5a5",
                                    color: "#b91c1c",
                                    borderRadius: "8px",
                                    padding: "10px 14px",
                                    marginBottom: "16px",
                                    fontSize: "0.9rem",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "18px" }}>
                                <label style={{ display: "block", fontSize: "0.9rem", marginBottom: "6px", fontWeight: "600" }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="name@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "10px",
                                        border: "1px solid #d1d5db",
                                        background: "#f9fafb",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "18px" }}>
                                <label style={{ display: "block", fontSize: "0.9rem", marginBottom: "6px", fontWeight: "600" }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "10px",
                                        border: "1px solid #d1d5db",
                                        background: "#f9fafb",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "24px" }}>
                                <label style={{ display: "block", fontSize: "0.9rem", marginBottom: "6px", fontWeight: "600" }}>
                                    I am a...
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "10px",
                                        border: "1px solid #d1d5db",
                                        background: "#f9fafb",
                                        boxSizing: "border-box",
                                        fontSize: "0.95rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    <option value="ROLE_USER">Boarder (looking for a room)</option>
                                    <option value="ROLE_ADMIN">Owner (listing a property)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: loading ? "#94a3b8" : "linear-gradient(180deg, #0b1445, #1e3a8a)",
                                    color: "white",
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    marginBottom: "20px",
                                }}
                            >
                                {loading ? "Creating account..." : "Create Account"}
                            </button>
                        </form>

                        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#6b7280" }}>
                            Already have an account?{" "}
                            <Link to="/login" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
