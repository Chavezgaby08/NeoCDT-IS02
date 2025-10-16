// Usuarios de prueba en memoria
const MOCK_USERS = [
    {
        id: 1,
        username: "admin",
        password: "123456",
        cedula: "1234567890",
        email: "admin@neocdt.com"
    },
    {
        id: 2,
        username: "test",
        password: "test123",
        cedula: "9876543210",
        email: "test@neocdt.com"
    }
];

export const loginUser = async (username, password) => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('🔵 [MOCK] Intentando login con:', { username });

    // Buscar usuario
    const user = MOCK_USERS.find(
        u => u.username === username && u.password === password
    );

    if (user) {
        console.log('✅ [MOCK] Login exitoso');
        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                cedula: user.cedula
            }
        };
    } else {
        console.log('❌ [MOCK] Login fallido');
        return {
            success: false,
            message: 'Usuario o contraseña incorrectos'
        };
    }
};

export const registerUser = async (userData) => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log('🔵 [MOCK] Intentando registro:', {
        username: userData.username,
        cedula: userData.cedula
    });

    // Verificar si el usuario ya existe
    const existingUser = MOCK_USERS.find(
        u => u.username === userData.username || u.cedula === userData.cedula
    );

    if (existingUser) {
        console.log('❌ [MOCK] Usuario ya existe');
        return {
            success: false,
            message: 'El usuario o cédula ya están registrados'
        };
    }

    // "Registrar" nuevo usuario (solo en memoria)
    const newUser = {
        id: MOCK_USERS.length + 1,
        username: userData.username,
        cedula: userData.cedula,
        email: userData.email,
        password: userData.password
    };

    MOCK_USERS.push(newUser);
    console.log('✅ [MOCK] Registro exitoso. Usuarios totales:', MOCK_USERS.length);

    return {
        success: true,
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            cedula: newUser.cedula
        }
    };
};

// Función helper para ver usuarios (solo para debug)
export const getMockUsers = () => {
    console.table(MOCK_USERS);
    return MOCK_USERS;
};