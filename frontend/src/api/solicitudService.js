import api from "./api";

const toNumberCOP = (v) => Number(String(v ?? "").replace(/[^\d]/g, "")) || 0;
const diasAmeses = (d) => Math.max(1, Math.round(Number(d || 0) / 30));

function buildBodyFromForm(input = {}) {
  const { monto, montoInput, plazo, plazoDias, plazoMeses } = input;

  const montoNumber = toNumberCOP(montoInput ?? monto);

  let meses;
  if (plazoMeses != null) {
    meses = Number(plazoMeses);
  } else if (plazoDias != null) {
    meses = diasAmeses(plazoDias);
  } else if (plazo != null) {
    const p = Number(plazo);
    meses = p >= 30 ? diasAmeses(p) : Math.max(1, p);
  }

  // ✅ Ya NO enviamos tasaInteres (la asigna el asesor al aprobar)
  const body = {
    monto: montoNumber,
    plazoMeses: meses,
  };

  if (!Number.isFinite(body.monto) || body.monto <= 0)
    throw new Error("Monto inválido");
  if (!Number.isFinite(body.plazoMeses) || body.plazoMeses <= 0)
    throw new Error("Plazo inválido");

  return body;
}

// ✅ Obtener todas las solicitudes
export async function getSolicitudes(params = {}) {
  try {
    const { page = 1, pageSize = 10 } = params;
    const { data } = await api.get("/solicitudes", {
      params: { page, pageSize },
    });
    console.log("📋 Solicitudes obtenidas:", data.length || 0);
    return data;
  } catch (error) {
    console.error("❌ Error obteniendo solicitudes:", error);
    throw new Error(
      error?.response?.data?.message ||
      error.message ||
      "Error al obtener solicitudes"
    );
  }
}

// ✅ Obtener solicitud por ID
export async function getSolicitudById(id) {
  try {
    const { data } = await api.get(`/solicitudes/${id}`);
    console.log("📋 Solicitud obtenida:", id, data);
    return data;
  } catch (error) {
    console.error("❌ Error obteniendo solicitud:", id, error);
    throw new Error(
      error?.response?.data?.message ||
      error.message ||
      "Solicitud no encontrada"
    );
  }
}

// ✅ Crear nueva solicitud
export async function createSolicitud(formData) {
  try {
    const body = buildBodyFromForm(formData);
    console.log("📤 Creando solicitud:", body);
    const { data } = await api.post("/solicitudes", body);
    console.log("✅ Solicitud creada:", data);
    return data;
  } catch (err) {
    console.error("❌ Error en createSolicitud:", err);
    console.error("Response:", err?.response?.data);
    throw new Error(
      err?.response?.data?.message ||
      err.message ||
      "Error al crear la solicitud"
    );
  }
}

// ✅ Actualizar solicitud
export async function updateSolicitud(id, formData) {
  try {
    const partial = {};

    if (formData.monto != null || formData.montoInput != null) {
      partial.monto = toNumberCOP(formData.montoInput ?? formData.monto);
    }

    if (formData.plazoMeses != null) {
      partial.plazoMeses = Number(formData.plazoMeses);
    } else if (formData.plazoDias != null) {
      partial.plazoMeses = diasAmeses(formData.plazoDias);
    } else if (formData.plazo != null) {
      const p = Number(formData.plazo);
      partial.plazoMeses = p >= 30 ? diasAmeses(p) : Math.max(1, p);
    }

    if (formData.tasaInteres != null || formData.tasa != null) {
      partial.tasaInteres = Number(formData.tasaInteres ?? formData.tasa);
    }

    if (formData.estado != null) {
      partial.estado = mapEstadoToBackend(formData.estado);
    }

    if (formData.motivoRechazo != null) {
      partial.motivoRechazo = formData.motivoRechazo;
    }

    console.log("📤 Actualizando solicitud:", id, partial);
    const { data } = await api.put(`/solicitudes/${id}`, partial);
    console.log("✅ Solicitud actualizada:", data);
    return data;
  } catch (err) {
    console.error("❌ Error actualizando solicitud:", id, err);
    throw new Error(
      err?.response?.data?.message ||
      err.message ||
      "Error al actualizar la solicitud"
    );
  }
}

// ✅ Eliminar solicitud
export async function deleteSolicitud(id) {
  try {
    console.log("📤 Eliminando solicitud:", id);
    const { data } = await api.delete(`/solicitudes/${id}`);
    console.log("✅ Solicitud eliminada:", id);
    return data;
  } catch (err) {
    console.error("❌ Error eliminando solicitud:", id, err);

    // Verificar si el error es por estado no válido
    if (err?.response?.status === 400) {
      throw new Error(
        err?.response?.data?.message ||
        "Solo se pueden eliminar solicitudes en estado Borrador"
      );
    }

    throw new Error(
      err?.response?.data?.message ||
      err.message ||
      "Error al eliminar la solicitud"
    );
  }
}

// ✅ Mapear estados frontend -> backend
const mapEstadoToBackend = (estadoFrontend) => {
  const mapeo = {
    Borrador: "BORRADOR",
    "En validación": "EN_VALIDACION",
    Aprobada: "APROBADA",
    Rechazada: "RECHAZADA",
    Cancelada: "CANCELADA",
  };
  return mapeo[estadoFrontend] || estadoFrontend;
};

// ✅ Función helper para debugging (opcional)
export function logApiStatus() {
  console.log("🔍 Estado del servicio de solicitudes:");
  console.log("- baseURL:", api.defaults.baseURL);
  console.log("- Token presente:", !!localStorage.getItem("token"));
}