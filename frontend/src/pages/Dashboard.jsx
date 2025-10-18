import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getSolicitudes } from "../api/solicitudService.js";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    aprobadas: 0,
    enValidacion: 0,
    montoTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const normalizeEstado = (estadoRaw) => {
    if (!estadoRaw) return "";
    // Admite estados como "APROBADA", "EN_VALIDACION", "Aprobada", "En validación", etc.
    const e = String(estadoRaw).trim().toUpperCase();
    if (e === "APROBADA") return "Aprobada";
    if (e === "EN_VALIDACION" || e === "EN VALIDACION") return "En validación";
    if (e === "RECHAZADA") return "Rechazada";
    if (e === "CANCELADA") return "Cancelada";
    if (e === "BORRADOR") return "Borrador";
    // fallback: capitaliza
    return estadoRaw
      .toString()
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/^\w/u, (c) => c.toUpperCase());
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const solicitudes = await getSolicitudes();

      const aprobadas = solicitudes.filter(
        (s) => normalizeEstado(s.estado) === "Aprobada",
      );
      const enValidacion = solicitudes.filter(
        (s) => normalizeEstado(s.estado) === "En validación",
      );

      const montoTotal = aprobadas.reduce(
        (sum, s) => sum + (Number(s.monto) || 0),
        0,
      );

      setStats({
        total: solicitudes.length,
        aprobadas: aprobadas.length,
        enValidacion: enValidacion.length,
        montoTotal,
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
      setStats({
        total: 0,
        aprobadas: 0,
        enValidacion: 0,
        montoTotal: 0,
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
        <h2>¡Hola, {user?.username || user?.email || "Usuario"}! 👋</h2>
        <p>Gestiona tus inversiones y consulta el estado de tus CDTs</p>
      </div>

      {loading ? (
        <div className="dashboard-stats">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ height: "120px" }}></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon">📊</div>
              <div className="stat-card-content">
                <h4>Total Solicitudes</h4>
                <p>{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div
                className="stat-icon"
                style={{
                  background: "linear-gradient(135deg, #4CAF50, #66BB6A)",
                }}
              >
                ✓
              </div>
              <div className="stat-card-content">
                <h4>Aprobadas</h4>
                <p>{stats.aprobadas}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
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
                <h4>En Validación</h4>
                <p>{stats.enValidacion}</p>
              </div>
            </div>
          </div>

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
                <h4>Monto Invertido</h4>
                <p style={{ fontSize: "1.5rem" }}>
                  {formatCurrency(stats.montoTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <button
          className="btn-primary"
          onClick={() => navigate("/solicitudes")}
          style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}
        >
          Ver Mis Solicitudes
        </button>
      </div>

      {/* Acciones Rápidas */}
      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <h3 style={{ marginBottom: "1.5rem", color: "var(--gray-700)" }}>
          Acciones Rápidas
        </h3>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn-secondary"
            onClick={() => navigate("/solicitudes")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "white",
              border: "2px solid var(--gray-300)",
              borderRadius: "var(--radius-full)",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📋 Ver todas las solicitudes
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate("/solicitudes/nueva")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "white",
              border: "2px solid var(--gray-300)",
              borderRadius: "var(--radius-full)",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ➕ Crear nueva solicitud
          </button>
        </div>
      </div>
    </div>
  );
}
