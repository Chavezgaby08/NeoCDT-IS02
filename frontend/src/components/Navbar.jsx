import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <nav className="navbar">
      <h2>BancoNex</h2>
      <div className="nav-links">
        <Link to="/dashboard">Inicio</Link>
        <Link to="/solicitudes">Solicitudes</Link>
        <button onClick={logout}>Cerrar sesión</button>
      </div>
    </nav>
  );
}
