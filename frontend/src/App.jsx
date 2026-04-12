import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Rooms from "./Rooms";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Rooms" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/rooms" element={<Rooms />} />
    </Routes>
  );
}

export default App;