
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "../pages/LoginPage";

describe("Prueba de LoginPage", () => {
  test("renderiza los campos de usuario y contraseña", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
  });

  test("permite escribir y enviar el formulario", () => {
    render(<LoginPage />);
    const userInput = screen.getByPlaceholderText(/usuario/i);
    const passInput = screen.getByPlaceholderText(/contraseña/i);
    const button = screen.getByRole("button", { name: /ingresar/i });

    fireEvent.change(userInput, { target: { value: "testuser" } });
    fireEvent.change(passInput, { target: { value: "1234" } });
    fireEvent.click(button);

    expect(userInput.value).toBe("testuser");
    expect(passInput.value).toBe("1234");
  });
});
