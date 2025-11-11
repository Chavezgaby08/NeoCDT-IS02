import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getEstadisticasAgente } from "../api/agenteService.js"

export default function AsesorDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalSolicitudes: 0,
        enValidacion: 0,
        aprobadasHoy: 0,
        rechazadasHoy: 0,
        montoTotalValidacion: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await getEstadisticasAgente();
            setStats({
                totalSolicitudes: data.totalSolicitudes || 0,
                enValidacion: data.enValidacion || 0,
                aprobadasHoy: data.aprobadasHoy || 0,
                rechazadasHoy: data.rechazadasHoy || 0,
                montoTotalValidacion: data.montoTotalValidacion || 0,
            });
        } catch (error) {
            console.error("Error cargando estadÃ­sticas:", error);
            setStats({
                totalSolicitudes: 0,
                enValidacion: 0,
                aprobadasHoy: 0,
                rechazadasHoy: 0,
                montoTotalValidacion: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(value || 0);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Panel de Asesor</h2>
                <p>¡Hola, {user?.email || "Asesor"}!</p>
                <p style={{ color: "var(--gray-600)", marginTop: "0.5rem" }}>
                    Gestiona y valida las solicitudes de CDT de todos los clientes
                </p>
            </div>

            {loading ? (
                <div className="dashboard-stats">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="stat-card">
                            <div className="skeleton" style={{ height: "120px" }}></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="dashboard-stats">
                    {/* Total Solicitudes */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-icon">📊</div>
                            <div className="stat-card-content">
                                <h4>Total Solicitudes</h4>
                                <p>{stats.totalSolicitudes}</p>
                            </div>
                        </div>
                    </div>

                    {/* En Validación - MÁS IMPORTANTE */}
                    <div className="stat-card" style={{ border: "2px solid var(--primary)" }}>
                        <div className="stat-card-header">
                            <div
                                className="stat-icon"
                                style={{
                                    background: "linear-gradient(135deg, #FF9800, #FFB74D)",
                                }}
                            >
                                ⏳
                            </div>
                            <div className="stat-card-content">
                                <h4>Pendientes Validación</h4>
                                <p style={{ color: "var(--primary)" }}>{stats.enValidacion}</p>
                            </div>
                        </div>
                    </div>

                    {/* Aprobadas Hoy */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div
                                className="stat-icon"
                                style={{
                                    background: "linear-gradient(135deg, #4CAF50, #66BB6A)",
                                }}
                            >
                                ✅
                            </div>
                            <div className="stat-card-content">
                                <h4>Aprobadas Hoy</h4>
                                <p>{stats.aprobadasHoy}</p>
                            </div>
                        </div>
                    </div>

                    {/* Rechazadas Hoy */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div
                                className="stat-icon"
                                style={{
                                    background: "linear-gradient(135deg, #F44336, #EF5350)",
                                }}
                            >
                                ❌
                            </div>
                            <div className="stat-card-content">
                                <h4>Rechazadas Hoy</h4>
                                <p>{stats.rechazadasHoy}</p>
                            </div>
                        </div>
                    </div>

                    {/* Monto Total en Validación */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div
                                className="stat-icon"
                                style={{
                                    background: "linear-gradient(135deg, #00D9B5, #26E7C5)",
                                }}
                            >
                                💰
                            </div>
                            <div className="stat-card-content">
                                <h4>Monto en Validación</h4>
                                <p style={{ fontSize: "1.5rem" }}>
                                    {formatCurrency(stats.montoTotalValidacion)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Acciones RÃ¡pidas */}
            <div className="dashboard-actions">
                <button
                    className="btn-primary"
                    onClick={() => navigate("/asesor/solicitudes")}
                    style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}
                >
                    Ver Todas las Solicitudes
                </button>

                {stats.enValidacion > 0 && (
                    <button
                        className="btn-secondary"
                        onClick={() => navigate("/asesor/solicitudes?filter=EN_VALIDACION")}
                        style={{
                            padding: "1rem 2rem",
                            fontSize: "1.1rem",
                            background: "linear-gradient(135deg, #FF9800, #FFB74D)",
                            color: "white",
                            border: "none",
                        }}
                    >
                        Validar Pendientes ({stats.enValidacion})
                    </button>
                )}
            </div>

            {/* Información adicional */}
            <div className="dashboard-info" style={{ marginTop: "3rem" }}>
                <h3 style={{ marginBottom: "1rem", color: "var(--gray-900)" }}>Tus Responsabilidades</h3>
                <ul
                    style={{
                        listStyle: "none",
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    <li style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span className="resp-ico" aria-hidden="true">{"\u2705"}</span>
                        <span style={{ color: "var(--gray-700)" }}>
                            Revisar y aprobar solicitudes en estado "En validación"
                        </span>
                    </li>
                    <li style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span className="resp-ico" aria-hidden="true">{"\uD83D\uDCCA"}</span>
                        <span style={{ color: "var(--gray-700)" }}>
                            Asignar tasas de intereres competitivas según el plazo y monto
                        </span>
                    </li>
                    <li style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span className="resp-ico" aria-hidden="true">{"\u274C"}</span>
                        <span style={{ color: "var(--gray-700)" }}>
                            Rechazar solicitudes que no cumplan con los requisitos
                        </span>
                    </li>
                    <li style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span className="resp-ico" aria-hidden="true">{"\uD83D\uDCC8"}</span>
                        <span style={{ color: "var(--gray-700)" }}>
                            Monitorear tendencias y generar reportes de inversión
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
