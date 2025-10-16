import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSolicitudById, deleteSolicitud, updateSolicitud } from "../api/solicitudService.js";

export default function DetalleSolicitud() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSolicitud();
    }, [id]);

    const loadSolicitud = async () => {
        setLoading(true);
        try {
            const data = await getSolicitudById(id);
            if (data) {
                setSolicitud(data);
            } else {
                alert("Solicitud no encontrada");
                navigate("/solicitudes");
            }
        } catch (error) {
            console.error("Error cargando solicitud:", error);
            alert("Error al cargar la solicitud");
            navigate("/solicitudes");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("¿Estás seguro de eliminar esta solicitud?")) {
            try {
                await deleteSolicitud(id);
                alert("Solicitud eliminada correctamente");
                navigate("/solicitudes");
            } catch (error) {
                console.error("Error eliminando solicitud:", error);
                alert(error.message || "Error al eliminar la solicitud");
            }
        }
    };

    const handleEnviarValidacion = async () => {
        if (window.confirm("¿Deseas enviar esta solicitud a validación?")) {
            try {
                await updateSolicitud(id, {
                    ...solicitud,
                    estado: "En validación"
                });
                alert("Solicitud enviada a validación");
                loadSolicitud();
            } catch (error) {
                console.error("Error enviando a validación:", error);
                alert("Error al enviar la solicitud");
            }
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoBadgeClass = (estado) => {
        const estadoMap = {
            "Borrador": "estado-borrador",
            "En validación": "estado-validacion",
            "Aprobada": "estado-aprobada",
            "Rechazada": "estado-rechazada",
            "Cancelada": "estado-cancelada"
        };
        return estadoMap[estado] || "estado-borrador";
    };

    const calcularRendimiento = () => {
        if (!solicitud?.tasa || !solicitud?.monto || !solicitud?.plazo) return null;

        const tasaDiaria = solicitud.tasa / 365 / 100;
        const rendimiento = solicitud.monto * tasaDiaria * solicitud.plazo;
        const montoFinal = solicitud.monto + rendimiento;

        return {
            rendimiento,
            montoFinal,
            tasaDiaria: (tasaDiaria * 100).toFixed(4)
        };
    };

    if (loading) {
        return (
            <div style={{
                maxWidth: '900px',
                margin: '2rem auto',
                padding: '0 1rem'
            }}>
                <div className="skeleton" style={{ height: '600px' }}></div>
            </div>
        );
    }

    if (!solicitud) return null;

    const esBorrador = solicitud.estado === "Borrador";
    const rendimiento = calcularRendimiento();

    return (
        <div style={{
            maxWidth: '900px',
            margin: '2rem auto',
            padding: '0 1rem'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate("/solicitudes")}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    ← Volver a solicitudes
                </button>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Detalle de Solicitud CDT</h2>
                        <p style={{ color: 'var(--gray-600)' }}>ID: {solicitud.id}</p>
                    </div>
                    <span className={`estado-badge ${getEstadoBadgeClass(solicitud.estado)}`}>
                        {solicitud.estado}
                    </span>
                </div>
            </div>

            {/* Monto Principal */}
            <div style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                padding: '3rem 2rem',
                borderRadius: 'var(--radius-xl)',
                color: 'white',
                marginBottom: '2rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                    Monto de Inversión
                </p>
                <h1 style={{
                    fontSize: '3rem',
                    margin: '0',
                    fontWeight: '800'
                }}>
                    {formatCurrency(solicitud.monto)}
                </h1>
            </div>

            {/* Información Principal */}
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-md)'
            }}>
                <h3 style={{ marginBottom: '1.5rem' }}>📋 Información General</h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }}>
                    <div className="detail-item">
                        <div style={{
                            color: 'var(--gray-600)',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem'
                        }}>
                            📅 Plazo
                        </div>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--gray-900)'
                        }}>
                            {solicitud.plazo} días
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--gray-500)',
                            marginTop: '0.25rem'
                        }}>
                            {Math.round(solicitud.plazo / 30)} meses aproximadamente
                        </div>
                    </div>

                    <div className="detail-item">
                        <div style={{
                            color: 'var(--gray-600)',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem'
                        }}>
                            📈 Tasa de Interés
                        </div>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: solicitud.tasa ? 'var(--success)' : 'var(--gray-400)'
                        }}>
                            {solicitud.tasa ? `${solicitud.tasa}% EA` : 'Pendiente'}
                        </div>
                        {solicitud.tasa && (
                            <div style={{
                                fontSize: '0.875rem',
                                color: 'var(--gray-500)',
                                marginTop: '0.25rem'
                            }}>
                                Efectivo Anual
                            </div>
                        )}
                    </div>

                    <div className="detail-item">
                        <div style={{
                            color: 'var(--gray-600)',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem'
                        }}>
                            🕐 Fecha de Creación
                        </div>
                        <div style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: 'var(--gray-900)'
                        }}>
                            {formatDate(solicitud.fechaCreacion)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Proyección de Rendimiento */}
            {rendimiento && (
                <div style={{
                    background: 'white',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: 'var(--shadow-md)',
                    border: '2px solid var(--success)'
                }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--success)' }}>
                        💰 Proyección de Rendimiento
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        <div>
                            <div style={{
                                color: 'var(--gray-600)',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem'
                            }}>
                                Intereses Generados
                            </div>
                            <div style={{
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                color: 'var(--success)'
                            }}>
                                {formatCurrency(rendimiento.rendimiento)}
                            </div>
                        </div>

                        <div>
                            <div style={{
                                color: 'var(--gray-600)',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem'
                            }}>
                                Monto Total al Vencimiento
                            </div>
                            <div style={{
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                color: 'var(--primary)'
                            }}>
                                {formatCurrency(rendimiento.montoFinal)}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        color: 'var(--gray-600)'
                    }}>
                        ℹ️ Cálculo basado en tasa efectiva anual de {solicitud.tasa}% aplicada durante {solicitud.plazo} días.
                    </div>
                </div>
            )}

            {/* Timeline de Estado */}
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-md)'
            }}>
                <h3 style={{ marginBottom: '1.5rem' }}>📍 Estado de la Solicitud</h3>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        padding: '1rem 1.5rem',
                        background: solicitud.estado === 'Borrador' ? 'var(--primary)' : 'var(--gray-200)',
                        color: solicitud.estado === 'Borrador' ? 'white' : 'var(--gray-600)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '600'
                    }}>
                        Borrador
                    </div>
                    <div style={{ fontSize: '1.5rem', color: 'var(--gray-300)' }}>→</div>
                    <div style={{
                        padding: '1rem 1.5rem',
                        background: solicitud.estado === 'En validación' ? 'var(--primary)' : 'var(--gray-200)',
                        color: solicitud.estado === 'En validación' ? 'white' : 'var(--gray-600)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '600'
                    }}>
                        En validación
                    </div>
                    <div style={{ fontSize: '1.5rem', color: 'var(--gray-300)' }}>→</div>
                    <div style={{
                        padding: '1rem 1.5rem',
                        background: ['Aprobada', 'Rechazada'].includes(solicitud.estado) ?
                            (solicitud.estado === 'Aprobada' ? 'var(--success)' : 'var(--error)') :
                            'var(--gray-200)',
                        color: ['Aprobada', 'Rechazada'].includes(solicitud.estado) ? 'white' : 'var(--gray-600)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '600'
                    }}>
                        {solicitud.estado === 'Aprobada' ? 'Aprobada' :
                            solicitud.estado === 'Rechazada' ? 'Rechazada' :
                                'Aprobada/Rechazada'}
                    </div>
                </div>
            </div>

            {/* Acciones */}
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                boxShadow: 'var(--shadow-md)'
            }}>
                <h3 style={{ marginBottom: '1.5rem' }}>⚡ Acciones</h3>

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    {esBorrador && (
                        <>
                            <button
                                className="btn-primary"
                                onClick={handleEnviarValidacion}
                                style={{ flex: 1, minWidth: '200px' }}
                            >
                                📤 Enviar a Validación
                            </button>

                            <button
                                className="btn-secondary"
                                onClick={() => navigate(`/solicitudes/edit/${id}`)}
                                style={{ flex: 1, minWidth: '200px' }}
                            >
                                ✏️ Editar Solicitud
                            </button>

                            <button
                                className="btn-delete"
                                onClick={handleDelete}
                                style={{
                                    flex: 1,
                                    minWidth: '200px',
                                    padding: '0.875rem'
                                }}
                            >
                                🗑️ Eliminar Solicitud
                            </button>
                        </>
                    )}

                    {!esBorrador && (
                        <div style={{
                            padding: '1rem',
                            background: 'var(--gray-100)',
                            borderRadius: 'var(--radius-md)',
                            width: '100%',
                            textAlign: 'center',
                            color: 'var(--gray-600)'
                        }}>
                            ℹ️ Esta solicitud no puede ser modificada porque está en estado "{solicitud.estado}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}