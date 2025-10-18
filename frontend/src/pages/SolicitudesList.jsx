import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSolicitudes,
  createSolicitud,
  deleteSolicitud,
  updateSolicitud,
} from "../api/solicitudService.js";
import SolicitudForm from "../components/SolicitudForm.jsx";

export default function SolicitudesList() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState("Todos");
  const navigate = useNavigate();

  useEffect(() => {
    loadSolicitudes();
  }, []);

  useEffect(() => {
    filterSolicitudes();
  }, [filterEstado, solicitudes]);

  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await getSolicitudes();
      setSolicitudes(data);
      setFilteredSolicitudes(data);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterSolicitudes = () => {
    if (filterEstado === "Todos") {
      setFilteredSolicitudes(solicitudes);
    } else {
      setFilteredSolicitudes(
        solicitudes.filter((s) => s.estado === filterEstado),
      );
    }
  };

  const handleCreate = async (solicitud) => {
    try {
      await createSolicitud({
        monto: solicitud.monto, // correcto
        plazo: solicitud.plazo, // correcto
        tasaInteres: solicitud.tasaInteres, // ahora obligatorio
      });
      setShowForm(false);
      loadSolicitudes();
    } catch (error) {
      console.error("Error creando solicitud:", error);
      alert(error.message || "Error al crear la solicitud");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta solicitud?")) {
      try {
        await deleteSolicitud(id);
        loadSolicitudes();
      } catch (error) {
        console.error("Error eliminando solicitud:", error);
        alert("Error al eliminar la solicitud");
      }
    }
  };

  const handleEnviarValidacion = async (solicitud) => {
    if (window.confirm("¿Deseas enviar esta solicitud a validación?")) {
      try {
        await updateSolicitud(solicitud.id, {
          ...solicitud,
          estado: "En validación",
        });
        loadSolicitudes();
      } catch (error) {
        console.error("Error enviando a validación:", error);
        alert("Error al enviar la solicitud");
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
      month: "short",
      day: "numeric",
    });
  };

  const getEstadoBadgeClass = (estado) => {
    const estadoMap = {
      Borrador: "estado-borrador",
      "En validación": "estado-validacion",
      Aprobada: "estado-aprobada",
      Rechazada: "estado-rechazada",
      Cancelada: "estado-cancelada",
    };
    return estadoMap[estado] || "estado-borrador";
  };

  return (
    <div className="solicitudes">
      {/* Header */}
      <div className="solicitudes-header">
        <h2>Mis Solicitudes CDT</h2>
        <button className="btn-new-solicitud" onClick={() => setShowForm(true)}>
          <span>➕</span>
          Nueva Solicitud
        </button>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filters-grid">
          <div className="form-group">
            <label>Filtrar por Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Borrador">Borrador</option>
              <option value="En validación">En validación</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="solicitudes-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="solicitud-card">
              <div className="skeleton" style={{ height: "200px" }}></div>
            </div>
          ))}
        </div>
      ) : filteredSolicitudes.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No hay solicitudes</h3>
          <p>
            {filterEstado === "Todos"
              ? "Aún no has creado ninguna solicitud de CDT"
              : `No tienes solicitudes con estado "${filterEstado}"`}
          </p>
          <button
            className="btn-primary"
            onClick={() => setShowForm(true)}
            style={{ marginTop: "1rem" }}
          >
            Crear mi primera solicitud
          </button>
        </div>
      ) : (
        /* Solicitudes Grid */
        <div className="solicitudes-grid">
          {filteredSolicitudes.map((solicitud) => {
            const esBorrador = solicitud.estado === "Borrador";

            return (
              <div
                key={solicitud.id}
                className="solicitud-card"
                onClick={() => navigate(`/solicitudes/${solicitud.id}`)}
              >
                <div className="solicitud-header">
                  <span className="solicitud-id">ID: {solicitud.id}</span>
                  <span
                    className={`estado-badge ${getEstadoBadgeClass(
                      solicitud.estado,
                    )}`}
                  >
                    {solicitud.estado}
                  </span>
                </div>

                <div className="solicitud-monto">
                  <span className="currency">$</span>
                  {formatCurrency(solicitud.monto).replace(/[^\d.,]/g, "")}
                </div>

                <div className="solicitud-details">
                  <div className="detail-row">
                    <span className="detail-label">Plazo</span>
                    <span className="detail-value">
                      {solicitud.plazoMeses
                        ? solicitud.plazoMeses * 30
                        : solicitud.plazo}{" "}
                      días
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fecha creación</span>
                    <span className="detail-value">
                      {formatDate(
                        solicitud.createdAt || solicitud.fechaCreacion,
                      )}
                    </span>
                  </div>

                  {/* Mostrar tasaInteres correctamente */}
                  {(solicitud.tasaInteres || solicitud.tasa) && (
                    <div className="detail-row">
                      <span className="detail-label">Tasa</span>
                      <span className="detail-value">
                        {solicitud.tasaInteres ?? solicitud.tasa}% EA
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="solicitud-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Botón Editar - Solo para Borrador */}
                  <button
                    className="btn-edit"
                    onClick={() =>
                      navigate(`/solicitudes/edit/${solicitud.id}`)
                    }
                    disabled={false}
                    title={
                      !esBorrador
                        ? "Solo se pueden editar solicitudes en Borrador"
                        : "Editar solicitud"
                    }
                  >
                    ✏️ Editar
                  </button>

                  {/* Botón Enviar - Solo para Borrador */}
                  {esBorrador && (
                    <button
                      className="btn-send"
                      onClick={() => handleEnviarValidacion(solicitud)}
                    >
                      📤 Enviar
                    </button>
                  )}

                  {/* Botón Eliminar - Solo para Borrador */}
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(solicitud.id)}
                    disabled={false}
                    title={
                      !esBorrador
                        ? "Solo se pueden eliminar solicitudes en Borrador"
                        : "Eliminar solicitud"
                    }
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <SolicitudForm
              onSubmit={handleCreate}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
