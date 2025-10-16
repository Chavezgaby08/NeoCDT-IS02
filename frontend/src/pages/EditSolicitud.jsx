import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSolicitudById, updateSolicitud } from "../api/solicitudService.js";

export default function EditSolicitud() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [solicitud, setSolicitud] = useState(null);
    const [monto, setMonto] = useState("");
    const [plazo, setPlazo] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadSolicitud();
    }, [id]);

    const loadSolicitud = async () => {
        setLoading(true);
        try {
            const data = await getSolicitudById(id);
            if (data) {
                // Solo permitir editar si está en Borrador
                if (data.estado !== "Borrador") {
                    alert("Solo se pueden editar solicitudes en estado Borrador");
                    navigate("/solicitudes");
                    return;
                }
                setSolicitud(data);
                setMonto(data.monto);
                setPlazo(data.plazo);
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

    const validate = () => {
        const newErrors = {};

        if (!monto || monto <= 0) {
            newErrors.monto = "El monto debe ser mayor a 0";
        } else if (monto < 1000000) {
            newErrors.monto = "El monto mínimo es $1,000,000 COP";
        }

        if (!plazo || plazo <= 0) {
            newErrors.plazo = "El plazo debe ser mayor a 0";
        } else if (plazo < 30) {
            newErrors.plazo = "El plazo mínimo es 30 días";
        } else if (plazo > 1825) {
            newErrors.plazo = "El plazo máximo es 1825 días (5 años)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setSaving(true);
        try {
            await updateSolicitud(id, {
                ...solicitud,
                monto: Number(monto),
                plazo: Number(plazo)
            });
            alert("Solicitud actualizada correctamente");
            navigate("/solicitudes");
        } catch (error) {
            console.error("Error actualizando solicitud:", error);
            alert("Error al actualizar la solicitud");
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return "";
        return new Intl.NumberFormat('es-CO').format(value);
    };

    const handleMontoChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setMonto(value);
    };

    const plazosComunes = [
        { dias: 30, label: "1 mes" },
        { dias: 90, label: "3 meses" },
        { dias: 180, label: "6 meses" },
        { dias: 360, label: "1 año" },
        { dias: 720, label: "2 años" }
    ];

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <div className="skeleton" style={{ width: '500px', height: '400px' }}></div>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '600px',
            margin: '2rem auto',
            padding: '0 1rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                boxShadow: 'var(--shadow-lg)'
            }}>
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
                            marginBottom: '1rem'
                        }}
                    >
                        ← Volver a solicitudes
                    </button>
                    <h2>Editar Solicitud CDT</h2>
                    <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
                        ID: {id} • Estado: <span className={`estado-badge estado-borrador`}>
                            {solicitud?.estado}
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="monto">
                            Monto a invertir <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--gray-600)',
                                fontWeight: '600',
                                zIndex: 1
                            }}>
                                $
                            </span>
                            <input
                                id="monto"
                                type="text"
                                value={formatCurrency(monto)}
                                onChange={handleMontoChange}
                                placeholder="1,000,000"
                                required
                                disabled={saving}
                                style={{ paddingLeft: '2rem' }}
                            />
                        </div>
                        {errors.monto && (
                            <span style={{
                                color: 'var(--error)',
                                fontSize: '0.875rem',
                                marginTop: '0.25rem',
                                display: 'block'
                            }}>
                                {errors.monto}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="plazo">
                            Plazo (días) <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <input
                            id="plazo"
                            type="number"
                            value={plazo}
                            onChange={(e) => setPlazo(e.target.value)}
                            placeholder="180"
                            required
                            min="30"
                            max="1825"
                            disabled={saving}
                        />
                        {errors.plazo && (
                            <span style={{
                                color: 'var(--error)',
                                fontSize: '0.875rem',
                                marginTop: '0.25rem',
                                display: 'block'
                            }}>
                                {errors.plazo}
                            </span>
                        )}
                    </div>

                    {/* Plazos comunes */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            fontSize: '0.875rem',
                            color: 'var(--gray-600)',
                            marginBottom: '0.5rem',
                            display: 'block'
                        }}>
                            Plazos más comunes:
                        </label>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                        }}>
                            {plazosComunes.map((p) => (
                                <button
                                    key={p.dias}
                                    type="button"
                                    onClick={() => setPlazo(p.dias)}
                                    style={{
                                        padding: '0.5rem 0.875rem',
                                        background: plazo == p.dias ? 'var(--primary)' : 'var(--gray-100)',
                                        color: plazo == p.dias ? 'white' : 'var(--gray-700)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate("/solicitudes")}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
