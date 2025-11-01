import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Si ya está logueado, redirigir al dashboard
    if (user) {
        navigate("/dashboard");
        return null;
    }

    return (
        <div className="homepage">
            {/* Navbar Landing */}
            <nav className="homepage-navbar">
                <div className="homepage-container">
                    <div className="navbar-brand">
                        <div className="navbar-logo">B</div>
                        <h2>BancoNex</h2>
                    </div>
                    <div className="homepage-nav-links">
                        <ThemeToggle />
                        <button
                            className="btn-ghost"
                            onClick={() => navigate("/login")}
                        >
                            Iniciar sesión
                        </button>
                        <button
                            className="btn-primary"
                            onClick={() => navigate("/register")}
                        >
                            Crear cuenta
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="homepage-container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                Tu dinero,
                                <br />
                                <span className="gradient-text">más inteligente</span>
                            </h1>
                            <p className="hero-subtitle">
                                Invierte en CDTs desde tu celular. Simple, rápido y 100% digital.
                                Haz crecer tu dinero con las mejores tasas del mercado.
                            </p>
                            <div className="hero-cta">
                                <button
                                    className="btn-hero-primary"
                                    onClick={() => navigate("/register")}
                                >
                                    Abrir mi cuenta gratis
                                </button>
                                <button
                                    className="btn-hero-secondary"
                                    onClick={() => navigate("/login")}
                                >
                                    Ya tengo cuenta
                                </button>
                            </div>
                            <div className="hero-stats">
                                <div className="stat-item">
                                    <div className="stat-number">$500M+</div>
                                    <div className="stat-label">En inversiones</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">50K+</div>
                                    <div className="stat-label">Clientes activos</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">8.5%</div>
                                    <div className="stat-label">Tasa EA promedio</div>
                                </div>
                            </div>
                        </div>
                        <div className="hero-image">
                            <div className="floating-card card-1">
                                <div className="card-icon">💰</div>
                                <div className="card-title">CDT Activo</div>
                                <div className="card-amount">$5,000,000</div>
                                <div className="card-detail">+8.5% EA</div>
                            </div>
                            <div className="floating-card card-2">
                                <div className="card-icon">📈</div>
                                <div className="card-title">Rendimientos</div>
                                <div className="card-amount">$425,000</div>
                                <div className="card-detail">Este mes</div>
                            </div>
                            <div className="floating-card card-3">
                                <div className="card-icon">✅</div>
                                <div className="card-title">Aprobado</div>
                                <div className="card-detail">En 2 minutos</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="homepage-container">
                    <div className="section-header">
                        <h2 className="section-title">¿Por qué BancoNex?</h2>
                        <p className="section-subtitle">
                            Todo lo que necesitas para invertir de forma inteligente
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚀</div>
                            <h3>100% Digital</h3>
                            <p>Abre tu CDT en minutos desde tu celular. Sin papeleos ni filas.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">💎</div>
                            <h3>Mejores Tasas</h3>
                            <p>Hasta 8.5% EA. Compara y elige el plazo que más te convenga.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3>Súper Seguro</h3>
                            <p>Tu dinero protegido con tecnología bancaria de última generación.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3>Sin Comisiones</h3>
                            <p>$0 en costos de apertura, manejo o cancelación. Todo transparente.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Control Total</h3>
                            <p>Consulta tus inversiones, rendimientos y estados en tiempo real.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Flexible</h3>
                            <p>Desde $1,000,000 COP. Plazos de 1 mes a 5 años. Tú decides.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="how-it-works-section">
                <div className="homepage-container">
                    <div className="section-header">
                        <h2 className="section-title">¿Cómo funciona?</h2>
                        <p className="section-subtitle">
                            3 pasos simples para empezar a invertir
                        </p>
                    </div>

                    <div className="steps-container">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <div className="step-icon">📝</div>
                            <h3>Crea tu cuenta</h3>
                            <p>Regístrate en menos de 2 minutos con tu cédula y email</p>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step-card">
                            <div className="step-number">2</div>
                            <div className="step-icon">💰</div>
                            <h3>Elige tu CDT</h3>
                            <p>Selecciona el monto y plazo que mejor se ajuste a tus metas</p>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step-card">
                            <div className="step-number">3</div>
                            <div className="step-icon">📈</div>
                            <h3>Haz crecer tu dinero</h3>
                            <p>Recibe intereses y consulta tus rendimientos en tiempo real</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="homepage-container">
                    <div className="cta-content">
                        <h2 className="cta-title">¿Listo para hacer crecer tu dinero?</h2>
                        <p className="cta-subtitle">
                            Únete a miles de personas que ya confían en BancoNex
                        </p>
                        <button
                            className="btn-cta"
                            onClick={() => navigate("/register")}
                        >
                            Abrir mi cuenta ahora
                        </button>
                        <p className="cta-note">
                            ✓ Gratis · ✓ Sin permanencia · ✓ 100% seguro
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="homepage-footer">
                <div className="homepage-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="navbar-logo">B</div>
                            <h3>BancoNex</h3>
                            <p>Invierte inteligente. Vive mejor.</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Producto</h4>
                                <a href="#features">CDTs</a>
                                <a href="#features">Tasas</a>
                                <a href="#features">Seguridad</a>
                            </div>
                            <div className="footer-column">
                                <h4>Compañía</h4>
                                <a href="#about">Nosotros</a>
                                <a href="#contact">Contacto</a>
                                <a href="#help">Ayuda</a>
                            </div>
                            <div className="footer-column">
                                <h4>Legal</h4>
                                <a href="#terms">Términos</a>
                                <a href="#privacy">Privacidad</a>
                                <a href="#cookies">Cookies</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2025 BancoNex. Todos los derechos reservados.</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                            Proyecto académico - Universidad Autónoma de Occidente
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}