
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SolicitudesList from "../pages/SolicitudesList";

describe("Prueba del CRUD de Solicitudes CDT", () => {
  test("renderiza la lista de solicitudes correctamente", () => {
    render(<SolicitudesList />);
    expect(screen.getByText(/solicitudes/i)).toBeInTheDocument();
  });

  test("permite crear una nueva solicitud", () => {
    render(<SolicitudesList />);
    const addButton = screen.getByRole("button", { name: /nueva solicitud/i });
    expect(addButton).toBeInTheDocument();
  });
});
