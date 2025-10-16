let solicitudesMock = [
    { id: 1, monto: 5000000, plazo: 180, estado: "Aprobada" },
    { id: 2, monto: 3000000, plazo: 90, estado: "En validación" },
];

export const getSolicitudes = async () => {
    return solicitudesMock;
};

export const createSolicitud = async (data) => {
    data.id = Date.now();
    data.estado = "Borrador";
    solicitudesMock.push(data);
    return data;
};

export const updateSolicitud = async (id, newData) => {
    solicitudesMock = solicitudesMock.map(s => s.id === id ? { ...s, ...newData } : s);
    return solicitudesMock.find(s => s.id === id);
};

export const deleteSolicitud = async (id) => {
    solicitudesMock = solicitudesMock.filter(s => s.id !== id);
    return true;
};

