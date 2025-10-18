const API_URL = "http://localhost:3000/api";

// Iniciar sesión
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: email, // El backend espera "username" pero es el email
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Error al iniciar sesión",
      };
    }

    // Guardar token y usuario en localStorage
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    console.error("Error en login:", error);
    return {
      success: false,
      message: "Error de conexión con el servidor",
    };
  }
};

// Registrar usuario
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombreCompleto: userData.nombreCompleto,
        username: userData.email || userData.correo, // username es el email
        cedula: userData.cedula,
        correo: userData.email || userData.correo,
        telefono: userData.telefono,
        password: userData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Error al registrar usuario",
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Error en registro:", error);
    return {
      success: false,
      message: "Error de conexión con el servidor",
    };
  }
};

// Cerrar sesión
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Obtener token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Obtener usuario actual
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Verificar si está autenticado
export const isAuthenticated = () => {
  return !!getToken();
};
