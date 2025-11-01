import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
            title={isDarkMode ? "Modo claro" : "Modo oscuro"}
        >
            {isDarkMode ? "☀️" : "🌙"}
        </button>
    );
}