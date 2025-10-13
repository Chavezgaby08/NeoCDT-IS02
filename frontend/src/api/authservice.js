export const loginUser = async (username, password) => {
    if (username === "cliente" && password === "1234") {
        return { success: true, user: { username, role: "cliente" } };
    } else {
        return { success: false, message: "Credenciales inválidas" };
    }
};
