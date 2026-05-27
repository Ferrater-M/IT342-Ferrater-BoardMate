import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import VerifyEmail from "./features/auth/VerifyEmail";
import VerifyPending from "./features/auth/VerifyPending";
import Dashboard from "./features/houses/Dashboard";
import Rooms from "./features/houses/Rooms";
import RoomDetails from "./features/houses/RoomDetails";
import AdminDashboard from "./features/admin/AdminDashboard";
import OwnerDashboard from "./features/owner/OwnerDashboard";
import ManageRooms from "./features/owner/ManageRooms";
import OwnerApplication from "./features/owner/OwnerApplication";
import MyVisits from "./features/houses/MyVisits";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-pending" element={<VerifyPending />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/my-visits" element={<MyVisits />} />
      <Route path="/roomdetails/:id" element={<RoomDetails />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/owner-dashboard" element={<OwnerDashboard />} />
      <Route path="/owner/house/:houseId/rooms" element={<ManageRooms />} />
      <Route path="/apply-owner" element={<OwnerApplication />} />
    </Routes>
  );
}

export default App;
