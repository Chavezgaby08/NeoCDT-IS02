import api from "./api";

const toNumberCOP = (v) => Number(String(v ?? "").replace(/[^\d]/g, "")) || 0;
const diasAmeses = (d) => Math.max(1, Math.round(Number(d || 0) / 30));

function buildBodyFromForm(input = {}) {
  const { monto, montoInput, plazo, plazoDias, plazoMeses, tasa, tasaInteres } =
    input;

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

  const body = {
    monto: montoNumber,
    plazoMeses: meses,
  };
  const t = tasaInteres ?? tasa;
  if (t != null && Number.isFinite(Number(t))) body.tasaInteres = Number(t);

  if (!Number.isFinite(body.monto) || body.monto <= 0)
    throw new Error("Monto inválido");
  if (!Number.isFinite(body.plazoMeses) || body.plazoMeses <= 0)
    throw new Error("Plazo inválido");

  return body;
}

export async function getSolicitudes(params = {}) {
  const { page = 1, pageSize = 10 } = params;
  const { data } = await api.get("/api/solicitudes", {
    params: { page, pageSize },
  });
  return data;
}

export async function getSolicitudById(id) {
  const { data } = await api.get(`/api/solicitudes/${id}`);
  return data;
}

export async function createSolicitud(formData) {
  try {
    const body = buildBodyFromForm(formData);
    const { data } = await api.post("/api/solicitudes", body);
    return data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Error al crear la solicitud",
    );
  }
}

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

    const { data } = await api.put(`/api/solicitudes/${id}`, partial);
    return data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Error al actualizar la solicitud",
    );
  }
}

export async function deleteSolicitud(id) {
  try {
    const { data } = await api.delete(`/api/solicitudes/${id}`);
    return data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Error al eliminar la solicitud",
    );
  }
}

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
