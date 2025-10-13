import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombreCompleto: "",
        username: "",
        cedula: "",
        correo: "",
        telefono: "",
        password: "",
        confirmarPassword: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = (e) => {
        e.preventDefault();

        // Validar contraseñas
        if (formData.password !== formData.confirmarPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        // Aquí luego se conectará con el backend
        setError("");
        alert("Registro simulado correctamente. Aquí Samuel y Mauriel van a conectar el backennnnnd");
        navigate("/"); // Redirije al login
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h2>Registro de Usuario</h2>
                <form onSubmit={handleRegister}>
                    <input
                        name="nombreCompleto"
                        placeholder="Nombre completo"
                        value={formData.nombreCompleto}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="username"
                        placeholder="Nombre de usuario"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="cedula"
                        placeholder="Cédula de ciudadanía"
                        value={formData.cedula}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="correo"
                        type="email"
                        placeholder="Correo electrónico"
                        value={formData.correo}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="telefono"
                        type="tel"
                        placeholder="Número de teléfono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="confirmarPassword"
                        type="password"
                        placeholder="Confirmar contraseña"
                        value={formData.confirmarPassword}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Registrarme</button>
                </form>

                {error && <p className="error">{error}</p>}

                <p className="register-text">
                    ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
}


