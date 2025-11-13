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
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
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
      console.log("Solicitudes recibidas:", data);
      setSolicitudes(data);
      setFilteredSolicitudes(data);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      alert(error.message || "Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const filterSolicitudes = () => {
    let filtered = [...solicitudes];

    if (filterEstado !== "Todos") {
      const estadoBackend = mapEstadoToBackend(filterEstado);
      filtered = filtered.filter((s) => s.estado === estadoBackend);
    }

    if (fechaDesde && fechaHasta) {
      filtered = filtered.filter((s) => {
        const fecha = new Date(s.createdAt || s.fechaCreacion);
        return fecha >= new Date(fechaDesde) && fecha <= new Date(fechaHasta);
      });
    }

    setFilteredSolicitudes(filtered);
  };

  const handleFiltrarFechas = () => {
    filterSolicitudes();
  };

  const handleCreate = async (solicitud) => {
    try {
      await createSolicitud({
        monto: solicitud.monto,
        plazo: solicitud.plazo,
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
        alert(error.message || "Error al eliminar la solicitud");
      }
    }
  };

  const handleEnviarValidacion = async (solicitud) => {
    if (window.confirm("¿Deseas enviar esta solicitud a validación?")) {
      try {
        await updateSolicitud(solicitud.id, {
          estado: "EN_VALIDACION",
        });
        console.log("Solicitud enviada a validación:", solicitud.id);
        loadSolicitudes();
      } catch (error) {
        console.error("Error enviando a validación:", error);
        alert(error.message || "Error al enviar la solicitud");
      }
    }
  };

  const handleCancelar = async (solicitud) => {
    if (
      window.confirm(
        "¿Estás seguro de cancelar esta solicitud? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await updateSolicitud(solicitud.id, {
          estado: "CANCELADA",
        });
        console.log("Solicitud cancelada:", solicitud.id);
        loadSolicitudes();
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
    // Return DD/MM/YYYY to match E2E expectations
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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

  const mapEstadoToBackend = (estadoFrontend) => {
    const mapeo = {
      Borrador: "BORRADOR",
      "En validación": "EN_VALIDACION",
      Rechazada: "RECHAZADA",
      Cancelada: "CANCELADA",
    };
    return mapeo[estadoFrontend] || estadoFrontend;
  };

  return (
    <div className="solicitudes">
      {/* Header */}
      <div className="solicitudes-header">
        <h2>Mis Solicitudes CDT</h2>
        <button className="btn-new-solicitud" onClick={() => setShowForm(true)}>
          Nueva Solicitud
        </button>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filters-grid">
          <div className="form-group">
            <label htmlFor="estado-filter">Estado</label>
            <select
              id="estado-filter"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Borrador">Borrador</option>
              <option value="En validación">En validación</option>
              <option value="Rechazada">Rechazada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fecha-desde">Fecha desde</label>
            <input
              type="date"
              id="fecha-desde"
              name="fecha-desde"
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha-hasta">Fecha hasta</label>
            <input
              type="date"
              id="fecha-hasta"
              name="fecha-hasta"
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>

          <button
            id="filtrar-btn"
            className="btn-primary"
            onClick={handleFiltrarFechas}
          >
            Filtrar
          </button>
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
          <div className="empty-state-icon"></div>
          <h3>No hay solicitudes</h3>
          <p>
            {filterEstado === "Todos"
              ? "No has creado ninguna solicitud de CDT"
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
            const esBorrador = solicitud.estado === "BORRADOR";
            const esEnValidacion = solicitud.estado === "EN_VALIDACION";
            const plazoEnDias = solicitud.plazoMeses * 30;

            return (
              <div
                key={solicitud.id}
                className="solicitud-card"
                onClick={() => navigate(`/solicitudes/${solicitud.id}`)}
              >
                <div className="solicitud-header">
                  <span className="solicitud-id">
                    ID: {solicitud.id.slice(0, 8)}
                  </span>
                  <span
                    className={`estado-badge ${getEstadoBadgeClass(
                      solicitud.estado
                    )}`}
                    data-testid={`estado-${solicitud.id}`}
                  >
                    {mapEstadoToDisplay(solicitud.estado)}
                  </span>
                </div>

                <div
                  className="solicitud-monto"
                  data-testid={`monto-${solicitud.id}`}
                >
                  <span className="currency">$</span>
                  {formatCurrency(solicitud.monto).replace(/[^\d.,]/g, "")}
                </div>

                <div className="solicitud-details">
                  <div className="detail-row">
                    <span className="detail-label">Plazo</span>
                    <span className="detail-value">{plazoEnDias} días</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fecha creación</span>
                    <span
                      className="detail-value"
                      data-testid={`fecha-${solicitud.id}`}
                    >
                      {formatDate(
                        solicitud.createdAt || solicitud.fechaCreacion
                      )}
                    </span>
                  </div>

                  {solicitud.tasaInteres &&
                    Number(solicitud.tasaInteres) > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">Tasa</span>
                        <span className="detail-value">
                          {solicitud.tasaInteres}% EA
                        </span>
                      </div>
                    )}
                </div>

                <div
                  className="solicitud-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Botón Editar - Solo para BORRADOR */}
                  <button
                    className="btn-edit"
                    onClick={() =>
                      navigate(`/solicitudes/edit/${solicitud.id}`)
                    }
                    disabled={!esBorrador}
                    title={
                      !esBorrador
                        ? "Solo se pueden editar solicitudes en Borrador"
                        : "Editar solicitud"
                    }
                  >
                    Editar
                  </button>

                  {/* Botón Enviar - Solo para BORRADOR */}
                  {esBorrador && (
                    <button
                      className="btn-send"
                      onClick={() => handleEnviarValidacion(solicitud)}
                    >
                      Enviar
                    </button>
                  )}

                  {/* Botón Eliminar - Solo para BORRADOR */}
                  {esBorrador && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(solicitud.id)}
                      title="Eliminar solicitud"
                    >
                      Eliminar
                    </button>
                  )}

                  {/* Botón Cancelar - Solo para EN_VALIDACION */}
                  {esEnValidacion && (
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancelar(solicitud)}
                      title="Cancelar solicitud En validación"
                      style={{
                        background: "linear-gradient(135deg, #FF9800, #FFB74D)",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "var(--radius-md)",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      Cancelar
                    </button>
                  )}
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

