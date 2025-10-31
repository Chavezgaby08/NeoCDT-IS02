import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">B</div>
        <h2>BancoNex</h2>
      </div>

      <div className="nav-links">
        <Link
          to="/dashboard"
          className={isActive('/dashboard')}
        >
          🏠 Inicio
        </Link>
        <Link
          to="/solicitudes"
          className={isActive('/solicitudes')}
        >
          📋 Solicitudes
        </Link>

        <div style={{
          borderLeft: '1px solid var(--gray-300)',
          height: '24px',
          margin: '0 0.5rem'
        }}></div>

        <span style={{
          color: 'var(--gray-600)',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          👤 {user?.username || user?.email || "Usuario"}
        </span>

        <button onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
