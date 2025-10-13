import { useEffect, useState } from "react";
import { getSolicitudes, createSolicitud, deleteSolicitud } from "../api/solicitudService.js";
import SolicitudForm from "../components/SolicitudForm.jsx";

export default function SolicitudesList() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadSolicitudes();
    }, []);

    const loadSolicitudes = async () => {
        const data = await getSolicitudes();
        setSolicitudes(data);
    };

    const handleCreate = async (solicitud) => {
        await createSolicitud(solicitud);
        setShowForm(false);
        loadSolicitudes();
    };

    const handleDelete = async (id) => {
        await deleteSolicitud(id);
        loadSolicitudes();
    };

    return (
        <div className="solicitudes">
            <h2>Mis Solicitudes CDT</h2>
            <button onClick={() => setShowForm(!showForm)}>Nueva Solicitud</button>

            {showForm && <SolicitudForm onSubmit={handleCreate} />}

            <ul>
                {solicitudes.map((s) => (
                    <li key={s.id}>
                        <p>Monto: {s.monto}</p>
                        <p>Plazo: {s.plazo} días</p>
                        <p>Estado: {s.estado}</p>
                        <button onClick={() => handleDelete(s.id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
