import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSolicitudById, updateSolicitud } from "../api/solicitudService.js";
import SolicitudForm from "../components/SolicitudForm.jsx";

export default function EditSolicitud() {
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
      console.log("📋 Solicitud cargada para editar:", data);

      if (data.estado !== "BORRADOR") {
        alert("Solo se pueden editar solicitudes en estado Borrador");
        navigate("/solicitudes");
        return;
      }

      setSolicitud(data);
    } catch (error) {
      console.error("Error cargando solicitud:", error);
      alert("Error al cargar la solicitud");
      navigate("/solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (solicitudActualizada) => {
    try {
      await updateSolicitud(id, {
        monto: solicitudActualizada.monto,
        plazo: solicitudActualizada.plazo,
      });
      navigate("/solicitudes");
    } catch (error) {
      console.error("Error actualizando solicitud:", error);
      alert("Error al actualizar la solicitud");
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" }}>
        <div className="skeleton" style={{ height: "400px" }}></div>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
        <h3>Solicitud no encontrada</h3>
        <button onClick={() => navigate("/solicitudes")} className="btn-primary">
          Volver a Mis Solicitudes
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" }}>
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
        ← Volver a Mis Solicitudes
      </button>

      <h2 style={{ marginBottom: "1rem" }}>Editar Solicitud</h2>
      <p style={{ color: "var(--gray-600)", marginBottom: "2rem" }}>
        ID: {solicitud.id.slice(0, 8)}...
      </p>

      <SolicitudForm
        solicitud={{
          monto: Number(solicitud.monto),
          plazo: solicitud.plazoMeses * 30,
        }}
        onSubmit={handleUpdate}
        onClose={() => navigate("/solicitudes")}
      />
    </div>
  );
}