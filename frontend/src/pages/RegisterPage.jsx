import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/authservice.js";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        cedula: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Si es cédula, solo permitir números
        if (name === "cedula") {
            const numericValue = value.replace(/\D/g, '');
            setFormData({
                ...formData,
                [name]: numericValue
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const validateForm = () => {
        if (!formData.username || !formData.cedula || !formData.email || !formData.password) {
            setError("Todos los campos son obligatorios");
            return false;
        }

        if (formData.username.length < 4) {
            setError("El usuario debe tener al menos 4 caracteres");
            return false;
        }

        // Validar cédula (7-10 dígitos es común en Colombia)
        if (formData.cedula.length < 7 || formData.cedula.length > 10) {
            setError("La cédula debe tener entre 7 y 10 dígitos");
            return false;
        }

        if (!formData.email.includes("@")) {
            setError("Ingresa un correo válido");
            return false;
        }

        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return false;
        }

        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) return;

        setLoading(true);
        try {
            const res = await registerUser(formData);
            if (res.success) {
                alert("¡Registro exitoso! Ahora puedes iniciar sesión");
                navigate("/");
            } else {
                setError(res.message || "Error al registrar usuario");
            }
        } catch (err) {
            setError("Error al registrar. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    // Formatear cédula con puntos (ejemplo: 1.234.567)
    const formatCedula = (value) => {
        if (!value) return "";
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <div className="register-page">
            <div className="register-card">
                {/* Logo/Brand */}
                <div className="navbar-logo" style={{ margin: '0 auto 1.5rem' }}>
                    BN
                </div>

                <h2>Crear Cuenta</h2>
                <p className="subtitle">Únete a BancoNex y comienza a invertir hoy</p>

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="username">
                            Nombre completo <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Juan Pérez"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cedula">
                            Cédula de ciudadanía <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <input
                            id="cedula"
                            name="cedula"
                            type="text"
                            placeholder="1234567890"
                            value={formatCedula(formData.cedula)}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            maxLength="12" // 10 dígitos + 2 puntos
                        />
                        <span style={{
                            fontSize: '0.875rem',
                            color: 'var(--gray-600)',
                            marginTop: '0.25rem',
                            display: 'block'
                        }}>
                            Solo números, sin puntos ni espacios
                        </span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            Correo Electrónico <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Contraseña <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
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
                        <label htmlFor="confirmPassword">
                            Confirmar Contraseña <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
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

                    {/* Términos y condiciones */}
                    <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--gray-600)',
                        textAlign: 'center',
                        marginTop: '0.5rem'
                    }}>
                        Al registrarte, aceptas nuestros{' '}
                        <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                            Términos y Condiciones
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Registrando..." : "Crear Cuenta"}
                    </button>
                </form>

                <p className="register-text">
                    ¿Ya tienes cuenta? <Link to="/">Inicia sesión aquí</Link>
                </p>
            </div>
        </div>
    );
}


