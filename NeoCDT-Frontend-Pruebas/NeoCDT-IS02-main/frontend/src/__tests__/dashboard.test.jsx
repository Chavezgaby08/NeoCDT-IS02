
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "../pages/Dashboard";

describe("Prueba del Dashboard", () => {
  test("renderiza correctamente el dashboard con sus elementos principales", () => {
    render(<Dashboard />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  test("muestra el botón de cerrar sesión si el usuario está autenticado", () => {
    render(<Dashboard />);
    const logoutButton = screen.queryByRole("button", { name: /cerrar sesión/i });
    expect(logoutButton).toBeInTheDocument();
  });
});
