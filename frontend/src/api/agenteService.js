import api from "./api";

// Obtener todas las solicitudes (para el agente)
export async function getAllSolicitudesAgente(params = {}) {
    try {
        const { estado, page = 1, limit = 50 } = params;
        const { data } = await api.get("/agente/solicitudes", {
            params: { estado, page, limit },
        });
        return data;
    } catch (error) {
        console.error("Error obteniendo solicitudes:", error);
        throw error;
    }
}

// Obtener estadísticas del dashboard del agente
export async function getEstadisticasAgente() {
    try {
        const { data } = await api.get("/agente/estadisticas");
        return data;
    } catch (error) {
        console.error("Error obteniendo estadísticas:", error);
        throw error;
    }
}

// Obtener solicitud por ID (sin restricción de cliente)
export async function getSolicitudByIdAgente(id) {
    try {
        const { data } = await api.get(`/agente/solicitudes/${id}`);
        return data;
    } catch (error) {
        console.error("Error obteniendo solicitud:", error);
        throw error;
    }
}

// Obtener historial de una solicitud
export async function getHistorialSolicitud(id) {
    try {
        const { data } = await api.get(`/agente/solicitudes/${id}/historial`);
        return data;
    } catch (error) {
        console.error("Error obteniendo historial:", error);
        throw error;
    }
}

// Aprobar solicitud
export async function aprobarSolicitud(id, { tasaInteres, observaciones }) {
    try {
        const { data } = await api.post(`/agente/solicitudes/${id}/aprobar`, {
            tasaInteres: tasaInteres ? Number(tasaInteres) : undefined,
            observaciones,
        });
        return data;
    } catch (error) {
        const message =
            error?.response?.data?.message || "Error al aprobar la solicitud";
        throw new Error(message);
    }
}

// Rechazar solicitud
export async function rechazarSolicitud(id, motivoRechazo) {
    try {
        const { data } = await api.post(`/agente/solicitudes/${id}/rechazar`, {
            motivoRechazo,
        });
        return data;
    } catch (error) {
        const message =
            error?.response?.data?.message || "Error al rechazar la solicitud";
        throw new Error(message);
    }
}