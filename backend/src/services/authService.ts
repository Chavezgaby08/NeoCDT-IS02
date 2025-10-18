import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/authValidator';
import { LoginResponse, RegisterResponse } from '../types';

export class AuthService {
  async register(data: RegisterInput): Promise<RegisterResponse> {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: data.correo },
          { cliente: { numeroDocumento: data.cedula } },
        ],
      },
    });

    if (existingUser) {
      throw new Error('Usuario o cédula ya registrados');
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(data.password);

    // Separar nombre completo en nombres y apellidos (simplificado)
    const partes = data.nombreCompleto.trim().split(' ');
    const nombres = partes.slice(0, Math.ceil(partes.length / 2)).join(' ');
    const apellidos = partes.slice(Math.ceil(partes.length / 2)).join(' ') || nombres;

    // Crear usuario y cliente en una transacción
    await prisma.usuario.create({
      data: {
        email: data.correo,
        password: hashedPassword,
        rol: 'CLIENTE',
        cliente: {
          create: {
            nombres,
            apellidos,
            tipoDocumento: 'CC',
            numeroDocumento: data.cedula,
            telefono: data.telefono,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
    };
  }

  async login(data: LoginInput): Promise<LoginResponse> {
    // Buscar usuario por email (usamos username como email)
    const usuario = await prisma.usuario.findUnique({
      where: { email: data.username },
    });

    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(data.password, usuario.password);

    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      throw new Error('Usuario inactivo');
    }

    // Generar token JWT
    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return {
      success: true,
      user: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      token,
    };
  }
}