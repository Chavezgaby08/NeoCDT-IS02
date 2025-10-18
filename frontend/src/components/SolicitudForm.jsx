import { useState } from "react";

export default function SolicitudForm({ onSubmit, onClose, initialData }) {
  const [monto, setMonto] = useState(initialData?.monto || "");
  const [plazo, setPlazo] = useState(initialData?.plazo || "");
  const [tasaInteres, setTasaInteres] = useState(
    initialData?.tasaInteres || "",
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

    if (!tasaInteres || tasaInteres <= 0) {
      newErrors.tasaInteres = "La tasa de interés es obligatoria";
    } else if (tasaInteres < 0.1 || tasaInteres > 20) {
      newErrors.tasaInteres = "La tasa debe estar entre 0.1% y 20%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        monto: Number(monto),
        plazo: Number(plazo),
        tasaInteres: Number(tasaInteres),
        estado: "Borrador",
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO").format(value);
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setMonto(value);
  };

  const plazosComunes = [
    { dias: 30, label: "1 mes" },
    { dias: 90, label: "3 meses" },
    { dias: 180, label: "6 meses" },
    { dias: 360, label: "1 año" },
    { dias: 720, label: "2 años" },
  ];

  return (
    <div className="form-solicitud">
      <div className="form-header">
        <h3>Nueva Solicitud CDT</h3>
        <button className="btn-close" onClick={onClose} type="button">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* MONTO */}
        <div className="form-group">
          <label htmlFor="monto">
            Monto a invertir <span style={{ color: "var(--error)" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--gray-600)",
                fontWeight: "600",
                zIndex: 1,
              }}
            >
              $
            </span>
            <input
              id="monto"
              type="text"
              value={formatCurrency(monto)}
              onChange={handleMontoChange}
              placeholder="1,000,000"
              required
              disabled={loading}
              style={{ paddingLeft: "2rem" }}
            />
          </div>
          {errors.monto && (
            <span style={{ color: "var(--error)", fontSize: "0.875rem" }}>
              {errors.monto}
            </span>
          )}
          <span style={{ fontSize: "0.875rem", color: "var(--gray-600)" }}>
            Monto mínimo: $1,000,000 COP
          </span>
        </div>

        {/* PLAZO */}
        <div className="form-group">
          <label htmlFor="plazo">
            Plazo (días) <span style={{ color: "var(--error)" }}>*</span>
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
            disabled={loading}
          />
          {errors.plazo && (
            <span style={{ color: "var(--error)", fontSize: "0.875rem" }}>
              {errors.plazo}
            </span>
          )}
        </div>

        {/* Tasa de interes*/}
        <div className="form-group">
          <label htmlFor="tasaInteres">
            Tasa de interés (%) <span style={{ color: "var(--error)" }}>*</span>
          </label>
          <input
            id="tasaInteres"
            type="number"
            step="0.1"
            min="0.1"
            max="20"
            value={tasaInteres}
            onChange={(e) => setTasaInteres(e.target.value)}
            placeholder="Ej: 10.5"
            required
            disabled={loading}
          />
          {errors.tasaInteres && (
            <span style={{ color: "var(--error)", fontSize: "0.875rem" }}>
              {errors.tasaInteres}
            </span>
          )}
        </div>

        {/* Plazos comunes */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              fontSize: "0.875rem",
              color: "var(--gray-600)",
              display: "block",
            }}
          >
            Plazos más comunes:
          </label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {plazosComunes.map((p) => (
              <button
                key={p.dias}
                type="button"
                onClick={() => setPlazo(p.dias)}
                style={{
                  padding: "0.5rem 0.875rem",
                  background:
                    plazo == p.dias ? "var(--primary)" : "var(--gray-100)",
                  color: plazo == p.dias ? "white" : "var(--gray-700)",
                  border: "none",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Información estimada */}
        {monto &&
          plazo &&
          tasaInteres &&
          !errors.monto &&
          !errors.plazo &&
          !errors.tasaInteres && (
            <div
              style={{
                background: "var(--gray-100)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.5rem",
              }}
            >
              <h4
                style={{
                  fontSize: "0.875rem",
                  color: "var(--gray-700)",
                  marginBottom: "0.75rem",
                  fontWeight: "600",
                }}
              >
                📊 Estimación de rentabilidad:
              </h4>
              <div style={{ fontSize: "0.875rem", color: "var(--gray-600)" }}>
                <p>💰 Monto: ${formatCurrency(monto)} COP</p>
                <p>
                  📅 Plazo: {plazo} días ({Math.round(plazo / 30)} meses)
                </p>
                <p>💹 Tasa: {tasaInteres}% EA</p>
              </div>
            </div>
          )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Guardando..." : "Crear Solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
}
