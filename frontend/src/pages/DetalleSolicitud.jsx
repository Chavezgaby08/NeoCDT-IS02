import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSolicitudById,
  deleteSolicitud,
  updateSolicitud,
} from "../api/solicitudService.js";

export default function DetalleSolicitud() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSolicitud();
  }, [id]);

  const loadSolicitud = async () => {
    try {
      setLoading(true);
      const data = await getSolicitudById(id);
      console.log("Solicitud cargada:", data);
      setSolicitud(data);
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
          estado: "EN_VALIDACION",
        });
        loadSolicitud();
      } catch (error) {
        console.error("Error enviando a validación:", error);
        alert(error.message || "Error al enviar la solicitud");
      }
    }
  };

  const handleCancelar = async () => {
    if (
      window.confirm(
        "¿Estás seguro de cancelar esta solicitud? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await updateSolicitud(id, {
          estado: "CANCELADA",
        });
        loadSolicitud();
      } catch (error) {
        console.error("Error cancelando solicitud:", error);
        alert(error.message || "Error al cancelar la solicitud");
      }
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const calcularRendimiento = () => {
    if (!solicitud || !solicitud.tasaInteres || solicitud.tasaInteres === 0) {
      return null;
    }
    const tasa = Number(solicitud.tasaInteres) / 100;
    const meses = solicitud.plazoMeses;
    const monto = Number(solicitud.monto);
    const rendimiento = monto * (tasa / 12) * meses;
    const montoFinal = monto + rendimiento;
    return { rendimiento, montoFinal };
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" }}>
        <div className="skeleton" style={{ height: "600px" }}></div>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
        <h3>Solicitud no encontrada</h3>
        <button onClick={() => navigate("/solicitudes")} className="btn-primary">
          Volver a Mis Solicitudes
        </button>
      </div>
    );
  }

  const esBorrador = solicitud.estado === "BORRADOR";
  const esEnValidacion = solicitud.estado === "EN_VALIDACION";
  const esAprobada = solicitud.estado === "APROBADA";
  const esRechazada = solicitud.estado === "RECHAZADA";
  const plazoEnDias = solicitud.plazoMeses * 30;
  const rendimiento = calcularRendimiento();

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" }}>
      {/* Header */}
      <button
        onClick={() => navigate("/solicitudes")}
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.5rem" }}>Detalle de Solicitud CDT</h2>
          <p style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>
            ID: {solicitud.id}
          </p>
        </div>
        <span className={`estado-badge ${getEstadoBadgeClass(solicitud.estado)}`} style={{ fontSize: "1rem" }}>
          {mapEstadoToDisplay(solicitud.estado)}
        </span>
      </div>

      {/* Monto Principal */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--primary), #00D9B5)",
          color: "white",
          padding: "3rem 2rem",
          borderRadius: "var(--radius-xl)",
          textAlign: "center",
          marginBottom: "2rem",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "0.5rem" }}>
          Monto de Inversión
        </div>
        <div style={{ fontSize: "3rem", fontWeight: "800" }}>
          {formatCurrency(solicitud.monto)}
        </div>
      </div>

      {/* Información General */}
      <div
        style={{
          background: "white",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          marginBottom: "2rem",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          Información General
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div>
            <div style={{ color: "var(--gray-600)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              Plazo
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--gray-900)" }}>
              {solicitud.plazoMeses} meses
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
              ({plazoEnDias} días aproximadamente)
            </div>
          </div>

          <div>
            <div style={{ color: "var(--gray-600)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              Tasa de Interés
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: "700", color: solicitud.tasaInteres > 0 ? "var(--success)" : "var(--gray-400)" }}>
              {solicitud.tasaInteres > 0 ? `${solicitud.tasaInteres}% EA` : "Pendiente de asignación"}
            </div>
            {solicitud.tasaInteres === 0 && (
              <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
                Se asignará al aprobar
              </div>
            )}
          </div>

          <div>
            <div style={{ color: "var(--gray-600)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              Fecha de Creación
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "600", color: "var(--gray-900)" }}>
              {formatDate(solicitud.createdAt)}
            </div>
          </div>

          {solicitud.fechaApertura && (
            <div>
              <div style={{ color: "var(--gray-600)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Fecha de Aprobación
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "600", color: "var(--success)" }}>
                {formatDate(solicitud.fechaApertura)}
              </div>
            </div>
          )}

          {solicitud.fechaVencimiento && (
            <div>
              <div style={{ color: "var(--gray-600)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                ⏰ Fecha de Vencimiento
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "600", color: "var(--primary)" }}>
                {formatDate(solicitud.fechaVencimiento)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proyección de Rendimiento - Solo si hay tasa */}
      {rendimiento && (
        <div
          style={{
            background: "white",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "var(--shadow-md)",
            border: "2px solid var(--success)",
          }}
        >
          <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            📊 Proyección de Rendimiento
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <div>
              <div style={{ color: "var(--gray-600)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Intereses Generados
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--success)" }}>
                {formatCurrency(rendimiento.rendimiento)}
              </div>
            </div>

            <div>
              <div style={{ color: "var(--gray-600)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Monto Total al Vencimiento
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--primary)" }}>
                {formatCurrency(rendimiento.montoFinal)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Motivo de Rechazo */}
      {esRechazada && solicitud.motivoRechazo && (
        <div
          style={{
            background: "rgba(244, 67, 54, 0.1)",
            border: "2px solid var(--error)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h4 style={{ color: "var(--error)", marginBottom: "0.75rem" }}>
            Motivo de Rechazo
          </h4>
          <p style={{ color: "var(--gray-900)", margin: 0 }}>
            {solicitud.motivoRechazo}
          </p>
        </div>
      )}

      {/* Información Estado */}
      {esBorrador && (
        <div
          style={{
            background: "rgba(33, 150, 243, 0.1)",
            border: "2px solid var(--primary)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h4 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>
            Estado: Borrador
          </h4>
          <p style={{ color: "var(--gray-700)", margin: 0 }}>
            Esta solicitud está en estado borrador. Puedes editarla o enviarla a validación cuando estés listo.
          </p>
        </div>
      )}

      {esEnValidacion && (
        <div
          style={{
            background: "rgba(255, 152, 0, 0.1)",
            border: "2px solid #FF9800",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h4 style={{ color: "#FF9800", marginBottom: "0.5rem" }}>
            Estado: En Validación
          </h4>
          <p style={{ color: "var(--gray-700)", margin: 0 }}>
            Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos cuando sea aprobada o rechazada.
          </p>
        </div>
      )}

      {/* Botones de Acción */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        {esBorrador && (
          <>
            <button
              className="btn-primary"
              onClick={() => navigate(`/solicitudes/edit/${id}`)}
              style={{ flex: 1, minWidth: "200px" }}
            >
              Editar Solicitud
            </button>

            <button
              className="btn-secondary"
              onClick={handleEnviarValidacion}
              style={{
                flex: 1,
                minWidth: "200px",
                background: "linear-gradient(135deg, #4CAF50, #66BB6A)",
                color: "white",
                border: "none",
              }}
            >
              Enviar a Validación
            </button>

            <button
              className="btn-delete"
              onClick={handleDelete}
              style={{ flex: 1, minWidth: "200px" }}
            >
              Eliminar
            </button>
          </>
        )}

        {esEnValidacion && (
          <button
            className="btn-cancel"
            onClick={handleCancelar}
            style={{
              flex: 1,
              minWidth: "200px",
              background: "linear-gradient(135deg, #FF9800, #FFB74D)",
              color: "white",
              border: "none",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancelar Solicitud
          </button>
        )}
      </div>
    </div>
  );
}