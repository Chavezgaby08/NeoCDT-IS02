import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllSolicitudesAgente } from "../api/agenteService.js";

export default function AsesorSolicitudesList() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterEstado, setFilterEstado] = useState("TODOS");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Leer filtro de la URL
        const filterFromURL = searchParams.get("filter");
        if (filterFromURL) {
            setFilterEstado(filterFromURL);
        }
    }, [searchParams]);

    useEffect(() => {
        loadSolicitudes();
    }, [filterEstado]);

    const loadSolicitudes = async () => {
        setLoading(true);
        try {
            const data = await getAllSolicitudesAgente({
                estado: filterEstado === "TODOS" ? undefined : filterEstado,
            });
            setSolicitudes(data.solicitudes || []);
        } catch (error) {
            console.error("Error cargando solicitudes:", error);
            setSolicitudes([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-CO", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getEstadoBadgeClass = (estado) => {
        const estadoMap = {
            BORRADOR: "estado-borrador",
            EN_VALIDACION: "estado-validacion",
            APROBADA: "estado-aprobada",
            RECHAZADA: "estado-rechazada",
            CANCELADA: "estado-cancelada",
        };
        return estadoMap[estado] || "estado-borrador";
    };

    const mapEstadoToDisplay = (estado) => {
        const mapeo = {
            BORRADOR: "Borrador",
            EN_VALIDACION: "En validación",
            APROBADA: "Aprobada",
            RECHAZADA: "Rechazada",
            CANCELADA: "Cancelada",
        };
        return mapeo[estado] || estado;
    };

    return (
        <div className="solicitudes">
            {/* Header */}
            <div className="solicitudes-header">
                <h2>Gestión de Solicitudes CDT</h2>
            </div>

            {/* Filtros */}
            <div className="filters-container">
                <div className="filters-grid">
                    <div className="form-group">
                        <label>Filtrar por Estado</label>
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                        >
                            <option value="TODOS">Todos los estados</option>
                            <option value="EN_VALIDACION">⏳ En validación</option>
                            <option value="BORRADOR">📝 Borrador</option>
                            <option value="APROBADA">✅ Aprobada</option>
                            <option value="RECHAZADA">❌ Rechazada</option>
                            <option value="CANCELADA">🚫 Cancelada</option>
                        </select>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div
                    style={{
                        marginTop: "1rem",
                        display: "flex",
                        gap: "1rem",
                        flexWrap: "wrap",
                    }}
                >
                    <div
                        style={{
                            padding: "0.5rem 1rem",
                            background: "var(--gray-100)",
                            borderRadius: "var(--radius-md)",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "var(--gray-700)",
                        }}
                    >
                        📊 Total: {solicitudes.length}
                    </div>
                    <div
                        style={{
                            padding: "0.5rem 1rem",
                            background: "rgba(255, 152, 0, 0.1)",
                            borderRadius: "var(--radius-md)",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "#FF9800",
                        }}
                    >
                        ⏳ En validación:{" "}
                        {solicitudes.filter((s) => s.estado === "EN_VALIDACION").length}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="solicitudes-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="solicitud-card">
                            <div className="skeleton" style={{ height: "250px" }}></div>
                        </div>
                    ))}
                </div>
            ) : solicitudes.length === 0 ? (
                /* Empty State */
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>No hay solicitudes</h3>
                    <p>
                        {filterEstado === "TODOS"
                            ? "No hay solicitudes registradas en el sistema"
                            : `No hay solicitudes con estado "${mapEstadoToDisplay(filterEstado)}"`}
                    </p>
                </div>
            ) : (
                /* Solicitudes Grid */
                <div className="solicitudes-grid">
                    {solicitudes.map((solicitud) => {
                        const esEnValidacion = solicitud.estado === "EN_VALIDACION";

                        return (
                            <div
                                key={solicitud.id}
                                className="solicitud-card"
                                style={{
                                    ...(esEnValidacion ? { border: "2px solid var(--primary)" } : {}),
                                }}
                            >
                                <div className="solicitud-header">
                                    <span className="solicitud-id">ID: {solicitud.id.slice(0, 8)}</span>
                                    <span
                                        className={`estado-badge ${getEstadoBadgeClass(
                                            solicitud.estado
                                        )}`}
                                    >
                                        {mapEstadoToDisplay(solicitud.estado)}
                                    </span>
                                </div>

                                <div className="solicitud-monto">
                                    <span className="currency">$</span>
                                    {formatCurrency(solicitud.monto).replace(/[^\d.,]/g, "")}
                                </div>

                                {/* Información del Cliente */}
                                {solicitud.cliente && (
                                    <div
                                        style={{
                                            background: "var(--gray-50)",
                                            padding: "0.75rem",
                                            borderRadius: "var(--radius-md)",
                                            marginTop: "1rem",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: "600",
                                                color: "var(--gray-700)",
                                                marginBottom: "0.25rem",
                                            }}
                                        >
                                            👤 Cliente
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.9rem",
                                                fontWeight: "700",
                                                color: "var(--gray-900)",
                                            }}
                                        >
                                            {solicitud.cliente.nombres} {solicitud.cliente.apellidos}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.85rem",
                                                color: "var(--gray-600)",
                                                marginTop: "0.25rem",
                                            }}
                                        >
                                            Correo: {solicitud.cliente.usuario?.email || "N/A"}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.85rem",
                                                color: "var(--gray-600)",
                                            }}
                                        >
                                            CC {solicitud.cliente.numeroDocumento}
                                        </div>
                                    </div>
                                )}

                                <div className="solicitud-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Plazo</span>
                                        <span className="detail-value">
                                            {solicitud.plazoMeses} meses
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Tasa</span>
                                        <span className="detail-value">
                                            {solicitud.tasaInteres}% EA
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Fecha creación</span>
                                        <span className="detail-value">
                                            {formatDate(solicitud.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Botón rápido para validar - SOLO si está en validación */}
                                {esEnValidacion && (
                                    <div
                                        style={{
                                            marginTop: "1rem",
                                            paddingTop: "1rem",
                                            borderTop: "1px solid var(--gray-200)",
                                        }}
                                    >
                                        <button
                                            className="btn-primary"
                                            onClick={() => navigate(`/asesor/solicitudes/${solicitud.id}/validar`)}
                                            style={{
                                                width: "100%",
                                                padding: "0.75rem",
                                            }}
                                        >
                                            Validar Ahora
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}