import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    cedula: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await register(formData);
      if (res.success) {
        alert("Usuario registrado exitosamente. Ahora puedes iniciar sesión.");
        navigate("/login");
      } else {
        setError(res.message || "Error al registrar usuario");
      }
    } catch (err) {
      console.error(err);
      setError("Error al registrar usuario. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="navbar-logo" style={{ margin: "0 auto 1.5rem" }}>
          BN
        </div>

        <h2>Crear Cuenta en BancoNex</h2>
        <p className="subtitle">Completa tus datos para registrarte</p>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="nombreCompleto">Nombre Completo</label>
            <input
              id="nombreCompleto"
              name="nombreCompleto"
              type="text"
              placeholder="Juan Pérez"
              value={formData.nombreCompleto}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="juan@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cedula">Cédula</label>
            <input
              id="cedula"
              name="cedula"
              type="text"
              placeholder="1234567890"
              value={formData.cedula}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              placeholder="3001234567"
              value={formData.telefono}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="register-text">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
