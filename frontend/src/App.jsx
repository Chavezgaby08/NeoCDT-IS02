import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SolicitudesList from "./pages/SolicitudesList.jsx";
import DetalleSolicitud from "./pages/DetalleSolicitud.jsx";
import EditSolicitud from "./pages/EditSolicitud.jsx";

// Importar páginas del Asesor
import AsesorDashboard from "./pages/AsesorDashboard.jsx";
import AsesorSolicitudesList from "./pages/AsesorSolicitudesList.jsx";
import ValidarSolicitud from "./pages/ValidarSolicitud.jsx";

import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { user } = useAuth();

  // Determinar si el usuario es AGENTE
  const isAgente = user?.rol === "AGENTE" || user?.rol === "ADMINISTRADOR";
  const isCliente = user?.rol === "CLIENTE";

  return (
    <div style={{ minHeight: "100vh" }}>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={user ? <Navigate to={isAgente ? "/asesor/dashboard" : "/dashboard"} /> : <LoginPage />}
        />
        <Route path="/register" element={<RegisterPage />} />

        {/* === RUTAS DE CLIENTE === */}
        <Route
          path="/dashboard"
          element={
            user ? (
              isCliente ? (
                <Dashboard />
              ) : (
                <Navigate to="/asesor/dashboard" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/solicitudes"
          element={
            user ? (
              isCliente ? (
                <SolicitudesList />
              ) : (
                <Navigate to="/asesor/solicitudes" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/solicitudes/:id"
          element={
            user ? (
              isCliente ? (
                <DetalleSolicitud />
              ) : (
                <Navigate to="/asesor/solicitudes" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/solicitudes/edit/:id"
          element={
            user ? (
              isCliente ? (
                <EditSolicitud />
              ) : (
                <Navigate to="/asesor/solicitudes" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* === RUTAS DE ASESOR/AGENTE === */}
        <Route
          path="/asesor/dashboard"
          element={
            user ? (
              isAgente ? (
                <AsesorDashboard />
              ) : (
                <Navigate to="/dashboard" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/asesor/solicitudes"
          element={
            user ? (
              isAgente ? (
                <AsesorSolicitudesList />
              ) : (
                <Navigate to="/solicitudes" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/asesor/solicitudes/:id"
          element={
            user ? (
              isAgente ? (
                <DetalleSolicitud />
              ) : (
                <Navigate to="/solicitudes" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/asesor/solicitudes/:id/validar"
          element={
            user ? (
              isAgente ? (
                <ValidarSolicitud />
              ) : (
                <Navigate to="/solicitudes" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Ruta por defecto - redirigir según el rol */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate to={isAgente ? "/asesor/dashboard" : "/dashboard"} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </div>
  );
}