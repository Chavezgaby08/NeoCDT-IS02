import { useState } from "react";

export default function SolicitudForm({ onSubmit, initialData }) {
    const [monto, setMonto] = useState(initialData?.monto || "");
    const [plazo, setPlazo] = useState(initialData?.plazo || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ monto: Number(monto), plazo: Number(plazo) });
    };

    return (
        <form onSubmit={handleSubmit} className="form-solicitud">
            <label>Monto:</label>
            <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} required />

            <label>Plazo (días):</label>
            <input type="number" value={plazo} onChange={(e) => setPlazo(e.target.value)} required />

            <button type="submit">Guardar</button>
        </form>
    );
}
