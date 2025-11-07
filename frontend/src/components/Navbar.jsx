import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Determinar si es agente o cliente
  const isAgente = user?.rol === "AGENTE" || user?.rol === "ADMINISTRADOR";
  const isCliente = user?.rol === "CLIENTE";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">B</div>
        <h2>BancoNex</h2>
      </div>

      <div className="nav-links">
        {/* Links para CLIENTE */}
        {isCliente && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/solicitudes"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Mis Solicitudes
            </NavLink>
          </>
        )}

        {/* Links para ASESOR/AGENTE */}
        {isAgente && (
          <>
            <NavLink
              to="/asesor/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/asesor/solicitudes"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              📋 Solicitudes
            </NavLink>
            <span
              style={{
                padding: "0.5rem 1rem",
                background: "var(--primary)",
                color: "white",
                borderRadius: "var(--radius-full)",
                fontSize: "0.85rem",
                fontWeight: "700",
              }}
            >
              👨‍💼 ASESOR
            </span>
          </>
        )}

        {/* Divisor */}
        <div
          style={{
            width: "1px",
            height: "24px",
            background: "var(--gray-300)",
            margin: "0 0.5rem",
          }}
        />

        {/* Usuario info */}
        <span
          style={{
            color: "var(--gray-700)",
            fontSize: "0.9rem",
            fontWeight: "600",
          }}
        >
          {user?.email || "Usuario"}
        </span>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Botón de Logout */}
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
    </nav>
  );
}