import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getSolicitudByIdAgente,
    aprobarSolicitud,
    rechazarSolicitud,
} from "../api/agenteService.js";

export default function ValidarSolicitud() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Estados para aprobar
    const [tasaInteres, setTasaInteres] = useState("");
    const [observaciones, setObservaciones] = useState("");

    // Estados para rechazar
    const [motivoRechazo, setMotivoRechazo] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        loadSolicitud();
    }, [id]);

    const loadSolicitud = async () => {
        setLoading(true);
        try {
            const data = await getSolicitudByIdAgente(id);
            setSolicitud(data);

            if (data.tasaInteres) {
                setTasaInteres(data.tasaInteres);
            }
        } catch (error) {
            console.error("Error cargando solicitud:", error);
            alert("Error al cargar la solicitud");
            navigate("/asesor/solicitudes");
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async () => {
        if (!tasaInteres || tasaInteres <= 0) {
            alert("Por favor, ingresa una tasa de interés válida");
            return;
        }

        if (
            !window.confirm(
                `¿Estás seguro de APROBAR esta solicitud con tasa ${tasaInteres}% EA?`
            )
        ) {
            return;
        }

        setProcessing(true);
        try {
            await aprobarSolicitud(id, {
                tasaInteres: Number(tasaInteres),
                observaciones,
            });
            alert("✅ Solicitud aprobada exitosamente");
            navigate("/asesor/solicitudes");
        } catch (error) {
            console.error("Error aprobando solicitud:", error);
            alert(error.message || "Error al aprobar la solicitud");
        } finally {
            setProcessing(false);
        }
    };

    const handleRechazar = async () => {
        if (!motivoRechazo || motivoRechazo.trim() === "") {
            alert("Por favor, ingresa un motivo de rechazo");
            return;
        }

        setProcessing(true);
        try {
            await rechazarSolicitud(id, motivoRechazo);
            alert("❌ Solicitud rechazada");
            navigate("/asesor/solicitudes");
        } catch (error) {
            console.error("Error rechazando solicitud:", error);
            alert(error.message || "Error al rechazar la solicitud");
        } finally {
            setProcessing(false);
            setShowRejectModal(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const calcularRendimiento = () => {
        if (!tasaInteres || !solicitud) return null;
        const tasa = Number(tasaInteres) / 100;
        const meses = solicitud.plazoMeses;
        const monto = Number(solicitud.monto);
        const rendimiento = monto * (tasa / 12) * meses;
        const montoFinal = monto + rendimiento;
        return { rendimiento, montoFinal };
    };

    if (loading) {
        return (
            <div
                style={{
                    maxWidth: "900px",
                    margin: "2rem auto",
                    padding: "0 1rem",
                }}
            >
                <div className="skeleton" style={{ height: "600px" }}></div>
            </div>
        );
    }

    if (!solicitud) return null;

    const esEnValidacion = solicitud.estado === "EN_VALIDACION";
    const rendimiento = calcularRendimiento();

    return (
        <div
            style={{
                maxWidth: "900px",
                margin: "2rem auto",
                padding: "0 1rem",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <button
                    onClick={() => navigate("/asesor/solicitudes")}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--primary)",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    ← Volver a solicitudes
                </button>
                <h2>Validar Solicitud de CDT</h2>
                <p style={{ color: "var(--gray-600)", marginTop: "0.5rem" }}>
                    ID: {solicitud.id}
                </p>
            </div>

            {/* Alert si NO está en validación */}
            {!esEnValidacion && (
                <div
                    style={{
                        background: "rgba(255, 152, 0, 0.1)",
                        border: "2px solid #FF9800",
                        borderRadius: "var(--radius-lg)",
                        padding: "1.5rem",
                        marginBottom: "2rem",
                        color: "#FF9800",
                        fontWeight: "600",
                    }}
                >
                    ⚠️ Esta solicitud está en estado "{solicitud.estado}" y no puede ser
                    validada. Solo las solicitudes en "EN_VALIDACION" pueden ser
                    aprobadas o rechazadas.
                </div>
            )}

            {/* Información del Cliente */}
            {solicitud.cliente && (
                <div
                    style={{
                        background: "white",
                        borderRadius: "var(--radius-lg)",
                        padding: "2rem",
                        marginBottom: "2rem",
                        boxShadow: "var(--shadow-md)",
                    }}
                >
                    <h3 style={{ marginBottom: "1.5rem" }}>👤 Información del Cliente</h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "1.5rem",
                        }}
                    >
                        <div>
                            <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
                                Nombre Completo
                            </div>
                            <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                                {solicitud.cliente.nombres} {solicitud.cliente.apellidos}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
                                Documento
                            </div>
                            <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                                {solicitud.cliente.numeroDocumento}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
                                Email
                            </div>
                            <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                                {solicitud.cliente.usuario?.email || "N/A"}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
                                Teléfono
                            </div>
                            <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                                {solicitud.cliente.telefono || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Información de la Solicitud */}
            <div
                style={{
                    background: "white",
                    borderRadius: "var(--radius-lg)",
                    padding: "2rem",
                    marginBottom: "2rem",
                    boxShadow: "var(--shadow-md)",
                }}
            >
                <h3 style={{ marginBottom: "1.5rem" }}>Detalles de la Solicitud</h3>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1.5rem",
                    }}
                >
                    <div>
                        <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
                            Monto Solicitado
                        </div>
                        <div
                            style={{
                                fontWeight: "800",
                                fontSize: "1.75rem",
                                color: "var(--primary)",
                            }}
                        >
                            {formatCurrency(solicitud.monto)}
                        </div>
                    </div>

                    <div>
                        <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
                            Plazo
                        </div>
                        <div
                            style={{
                                fontWeight: "800",
                                fontSize: "1.75rem",
                                color: "var(--gray-900)",
                            }}
                        >
                            {solicitud.plazoMeses} meses
                        </div>
                    </div>

                    <div>
                        <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
                            Tasa Actual
                        </div>
                        <div
                            style={{
                                fontWeight: "800",
                                fontSize: "1.75rem",
                                color: solicitud.tasaInteres ? "var(--success)" : "var(--gray-400)",
                            }}
                        >
                            {solicitud.tasaInteres ? `${solicitud.tasaInteres}% EA` : "Sin asignar"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulario de Validación - Solo si está EN_VALIDACION */}
            {esEnValidacion && (
                <div
                    style={{
                        background: "white",
                        borderRadius: "var(--radius-lg)",
                        padding: "2rem",
                        marginBottom: "2rem",
                        boxShadow: "var(--shadow-md)",
                        border: "2px solid var(--primary)",
                    }}
                >
                    <h3 style={{ marginBottom: "1.5rem", color: "var(--primary)" }}>
                        ⚡ Validar Solicitud
                    </h3>

                    <div className="form-group">
                        <label htmlFor="tasaInteres">
                            Tasa de Interés (% EA) <span style={{ color: "var(--error)" }}>*</span>
                        </label>
                        <input
                            id="tasaInteres"
                            type="number"
                            step="0.1"
                            min="0"
                            max="20"
                            value={tasaInteres}
                            onChange={(e) => setTasaInteres(e.target.value)}
                            placeholder="Ej: 8.5"
                            disabled={processing}
                        />
                        <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", marginTop: "0.5rem" }}>
                            💡 Tasa sugerida: 7% - 8,5% EA según el plazo y monto
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="observaciones">Observaciones (Opcional)</label>
                        <textarea
                            id="observaciones"
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Comentarios adicionales..."
                            disabled={processing}
                            rows="3"
                            style={{
                                width: "100%",
                                padding: "0.875rem 1rem",
                                border: "2px solid var(--gray-300)",
                                borderRadius: "var(--radius-md)",
                                fontSize: "1rem",
                                resize: "vertical",
                            }}
                        />
                    </div>

                    {/* Proyección de Rendimiento */}
                    {rendimiento && (
                        <div
                            style={{
                                background: "var(--gray-50)",
                                padding: "1.5rem",
                                borderRadius: "var(--radius-md)",
                                marginTop: "1.5rem",
                            }}
                        >
                            <h4 style={{ marginBottom: "1rem", color: "var(--gray-900)" }}>
                                📊 Proyección de Rendimiento
                            </h4>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: "1rem",
                                }}
                            >
                                <div>
                                    <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
                                        Intereses Generados
                                    </div>
                                    <div style={{ fontWeight: "700", fontSize: "1.25rem", color: "var(--success)" }}>
                                        {formatCurrency(rendimiento.rendimiento)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
                                        Monto Total al Vencimiento
                                    </div>
                                    <div style={{ fontWeight: "700", fontSize: "1.25rem", color: "var(--primary)" }}>
                                        {formatCurrency(rendimiento.montoFinal)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            marginTop: "2rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            className="btn-primary"
                            onClick={handleAprobar}
                            disabled={processing || !tasaInteres}
                            style={{
                                flex: 1,
                                minWidth: "200px",
                                padding: "1rem",
                                fontSize: "1.1rem",
                            }}
                        >
                            {processing ? "Procesando..." : "Aprobar Solicitud"}
                        </button>

                        <button
                            className="btn-delete"
                            onClick={() => setShowRejectModal(true)}
                            disabled={processing}
                            style={{
                                flex: 1,
                                minWidth: "200px",
                                padding: "1rem",
                                fontSize: "1.1rem",
                            }}
                        >
                            Rechazar Solicitud
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Rechazo */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "white",
                            borderRadius: "var(--radius-xl)",
                            padding: "2.5rem",
                            width: "90%",
                            maxWidth: "500px",
                            boxShadow: "var(--shadow-xl)",
                        }}
                    >
                        <h3 style={{ marginBottom: "1.5rem", color: "var(--error)" }}>
                            ❌ Rechazar Solicitud
                        </h3>

                        <div className="form-group">
                            <label htmlFor="motivoRechazo">
                                Motivo del Rechazo <span style={{ color: "var(--error)" }}>*</span>
                            </label>
                            <textarea
                                id="motivoRechazo"
                                value={motivoRechazo}
                                onChange={(e) => setMotivoRechazo(e.target.value)}
                                placeholder="Explica por qué se rechaza esta solicitud..."
                                rows="4"
                                autoFocus
                                style={{
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    border: "2px solid var(--gray-300)",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: "1rem",
                                    resize: "vertical",
                                }}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "1rem",
                                marginTop: "2rem",
                            }}
                        >
                            <button
                                className="btn-secondary"
                                onClick={() => setShowRejectModal(false)}
                                disabled={processing}
                                style={{ flex: 1 }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-delete"
                                onClick={handleRechazar}
                                disabled={processing || !motivoRechazo.trim()}
                                style={{ flex: 1 }}
                            >
                                {processing ? "Procesando..." : "Confirmar Rechazo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}