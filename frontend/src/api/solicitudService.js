//REEMPLAZAR CUANDO EL BACKEND ESTÉ LISTO

// Simulación de base de datos en memoria
let MOCK_SOLICITUDES = [
    {
        id: 1,
        monto: 5000000,
        plazo: 180,
        estado: "Aprobada",
        fechaCreacion: "2025-01-15T10:00:00Z",
        tasa: 8.5
    },
    {
        id: 2,
        monto: 3000000,
        plazo: 90,
        estado: "En validación",
        fechaCreacion: "2025-02-01T14:30:00Z",
        tasa: null
    },
    {
        id: 3,
        monto: 10000000,
        plazo: 360,
        estado: "Borrador",
        fechaCreacion: "2025-02-10T09:15:00Z",
        tasa: null
    }
];

let nextId = 4;

// Simular delay de red
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getSolicitudes = async () => {
    await delay(300);
    console.log('📋 [MOCK] Obteniendo solicitudes:', MOCK_SOLICITUDES.length);
    return [...MOCK_SOLICITUDES];
};

export const getSolicitudById = async (id) => {
    await delay(300);
    const solicitud = MOCK_SOLICITUDES.find(s => s.id === parseInt(id));
    console.log('📋 [MOCK] Obteniendo solicitud:', id, solicitud);
    return solicitud;
};

export const createSolicitud = async (solicitud) => {
    await delay(500);

    const nuevaSolicitud = {
        id: nextId++,
        ...solicitud,
        fechaCreacion: new Date().toISOString(),
        tasa: null
    };

    MOCK_SOLICITUDES.push(nuevaSolicitud);
    console.log('✅ [MOCK] Solicitud creada:', nuevaSolicitud);
    return nuevaSolicitud;
};

export const updateSolicitud = async (id, solicitudActualizada) => {
    await delay(500);

    const index = MOCK_SOLICITUDES.findIndex(s => s.id === parseInt(id));

    if (index !== -1) {
        MOCK_SOLICITUDES[index] = {
            ...MOCK_SOLICITUDES[index],
            ...solicitudActualizada,
            id: parseInt(id) // Mantener el ID original
        };
        console.log('✅ [MOCK] Solicitud actualizada:', MOCK_SOLICITUDES[index]);
        return MOCK_SOLICITUDES[index];
    } else {
        console.error('❌ [MOCK] Solicitud no encontrada:', id);
        throw new Error('Solicitud no encontrada');
    }
};

export const deleteSolicitud = async (id) => {
    await delay(400);

    const index = MOCK_SOLICITUDES.findIndex(s => s.id === parseInt(id));

    if (index !== -1) {
        // Solo permitir eliminar si está en Borrador
        if (MOCK_SOLICITUDES[index].estado !== "Borrador") {
            console.error('❌ [MOCK] No se puede eliminar. Estado:', MOCK_SOLICITUDES[index].estado);
            throw new Error('Solo se pueden eliminar solicitudes en estado Borrador');
        }

        const eliminada = MOCK_SOLICITUDES.splice(index, 1);
        console.log('✅ [MOCK] Solicitud eliminada:', eliminada[0]);
        return true;
    } else {
        console.error('❌ [MOCK] Solicitud no encontrada:', id);
        throw new Error('Solicitud no encontrada');
    }
};

// Función helper para debugging
export const resetMockData = () => {
    MOCK_SOLICITUDES = [
        {
            id: 1,
            monto: 5000000,
            plazo: 180,
            estado: "Aprobada",
            fechaCreacion: "2025-01-15T10:00:00Z",
            tasa: 8.5
        },
        {
            id: 2,
            monto: 3000000,
            plazo: 90,
            estado: "En validación",
            fechaCreacion: "2025-02-01T14:30:00Z",
            tasa: null
        },
        {
            id: 3,
            monto: 10000000,
            plazo: 360,
            estado: "Borrador",
            fechaCreacion: "2025-02-10T09:15:00Z",
            tasa: null
        }
    ];
    nextId = 4;
    console.log('🔄 [MOCK] Datos reseteados');
};

export const getMockStats = () => {
    console.table(MOCK_SOLICITUDES);
    return {
        total: MOCK_SOLICITUDES.length,
        porEstado: {
            Borrador: MOCK_SOLICITUDES.filter(s => s.estado === "Borrador").length,
            "En validación": MOCK_SOLICITUDES.filter(s => s.estado === "En validación").length,
            Aprobada: MOCK_SOLICITUDES.filter(s => s.estado === "Aprobada").length,
            Rechazada: MOCK_SOLICITUDES.filter(s => s.estado === "Rechazada").length,
            Cancelada: MOCK_SOLICITUDES.filter(s => s.estado === "Cancelada").length,
        }
    };
};

