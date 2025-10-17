import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SolicitudesList from "./pages/SolicitudesList.jsx";
import DetalleSolicitud from "./pages/DetalleSolicitud.jsx";
import EditSolicitud from "./pages/EditSolicitud.jsx";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh' }}>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/solicitudes" element={user ? <SolicitudesList /> : <Navigate to="/" />} />
        <Route path="/solicitudes/:id" element={user ? <DetalleSolicitud /> : <Navigate to="/" />} />
        <Route path="/solicitudes/edit/:id" element={user ? <EditSolicitud /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}