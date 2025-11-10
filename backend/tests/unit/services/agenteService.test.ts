import "@jest/globals";
import { AgenteService } from "../../../src/services/agenteService";
import { prismaMock } from "../../_mocks_/prismaClient";
import { EstadoSolicitud } from "@prisma/client";

jest.mock("@prisma/client");

describe("AgenteService", () => {
  let service: AgenteService;
  const mockAgenteId = "agent-123";
  const mockSolicitudId = "solicitud-123";

  beforeEach(() => {
    service = new AgenteService();
    jest.clearAllMocks();
  });

  describe("getAllSolicitudes", () => {
    const mockSolicitudes = [
      {
        id: "solicitud-1",
        estado: "EN_VALIDACION" as EstadoSolicitud,
        cliente: {
          nombres: "John",
          apellidos: "Doe",
          numeroDocumento: "123456789",
          telefono: "1234567890",
          usuario: {
            email: "john@example.com",
          },
        },
      },
    ];

    it("should return all solicitudes with pagination", async () => {
      // Arrange
      (prismaMock.solicitudCDT.findMany as jest.Mock).mockResolvedValueOnce(
        mockSolicitudes
      );
      (prismaMock.solicitudCDT.count as jest.Mock).mockResolvedValueOnce(1);

      // Act
      const result = await service.getAllSolicitudes({});

      // Assert
      expect(result).toEqual({
        solicitudes: mockSolicitudes,
        pagination: {
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
    });

    it("should filter by estado", async () => {
      // Arrange
      const filters = { estado: "EN_VALIDACION" };
      (prismaMock.solicitudCDT.findMany as jest.Mock).mockResolvedValueOnce(
        mockSolicitudes
      );
      (prismaMock.solicitudCDT.count as jest.Mock).mockResolvedValueOnce(1);

      // Act
      await service.getAllSolicitudes(filters);

      // Assert
      expect(prismaMock.solicitudCDT.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { estado: "EN_VALIDACION" },
        })
      );
    });

    it("should handle pagination", async () => {
      // Arrange
      const filters = { page: 2, limit: 10 };
      (prismaMock.solicitudCDT.findMany as jest.Mock).mockResolvedValueOnce(
        mockSolicitudes
      );
      (prismaMock.solicitudCDT.count as jest.Mock).mockResolvedValueOnce(15);

      // Act
      const result = await service.getAllSolicitudes(filters);

      // Assert
      expect(result.pagination).toEqual({
        total: 15,
        page: 2,
        limit: 10,
        totalPages: 2,
      });
      expect(prismaMock.solicitudCDT.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });
  });

  describe("getEstadisticas", () => {
    it("should return dashboard statistics", async () => {
      // Arrange
      (prismaMock.solicitudCDT.count as jest.Mock)
        .mockResolvedValueOnce(100) // totalSolicitudes
        .mockResolvedValueOnce(20) // enValidacion
        .mockResolvedValueOnce(5) // aprobadasHoy
        .mockResolvedValueOnce(2); // rechazadasHoy

      (prismaMock.solicitudCDT.aggregate as jest.Mock).mockResolvedValueOnce({
        _sum: { monto: 5000000 },
      });

      // Act
      const result = await service.getEstadisticas();

      // Assert
      expect(result).toEqual({
        totalSolicitudes: 100,
        enValidacion: 20,
        aprobadasHoy: 5,
        rechazadasHoy: 2,
        montoTotalValidacion: 5000000,
      });
    });

    it("should handle zero values", async () => {
      // Arrange
      (prismaMock.solicitudCDT.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      (prismaMock.solicitudCDT.aggregate as jest.Mock).mockResolvedValueOnce({
        _sum: { monto: null },
      });

      // Act
      const result = await service.getEstadisticas();

      // Assert
      expect(result).toEqual({
        totalSolicitudes: 0,
        enValidacion: 0,
        aprobadasHoy: 0,
        rechazadasHoy: 0,
        montoTotalValidacion: 0,
      });
    });
  });

  describe("aprobarSolicitud", () => {
    const mockSolicitud = {
      id: mockSolicitudId,
      estado: "EN_VALIDACION" as EstadoSolicitud,
      plazoMeses: 12,
      tasaInteres: 5,
    };

    it("should approve solicitud successfully", async () => {
      // Arrange
      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        mockSolicitud
      );

      const mockUpdatedSolicitud = {
        ...mockSolicitud,
        estado: "APROBADA",
        fechaApertura: expect.any(Date),
        fechaVencimiento: expect.any(Date),
      };

      (prismaMock.solicitudCDT.update as jest.Mock).mockResolvedValueOnce(
        mockUpdatedSolicitud
      );
      (prismaMock.historialEstado.create as jest.Mock).mockResolvedValueOnce(
        {}
      );

      // Act
      const result = await service.aprobarSolicitud(
        mockSolicitudId,
        mockAgenteId,
        6,
        "Aprobado"
      );

      // Assert
      expect(result).toEqual(mockUpdatedSolicitud);
      expect(prismaMock.historialEstado.create).toHaveBeenCalledWith({
        data: {
          solicitudId: mockSolicitudId,
          estadoAnterior: "EN_VALIDACION",
          estadoNuevo: "APROBADA",
          observaciones: "Aprobado",
          cambiadoPor: mockAgenteId,
        },
      });
    });

    it("should calculate correct dates when approving solicitud", async () => {
      // Arrange
      const currentDate = new Date("2023-11-15");
      jest.useFakeTimers().setSystemTime(currentDate);

      const mockSolicitudConPlazo = {
        ...mockSolicitud,
        plazoMeses: 6,
      };

      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        mockSolicitudConPlazo
      );

      const expectedFechaVencimiento = new Date("2024-05-15"); // 6 meses después

      (prismaMock.solicitudCDT.update as jest.Mock).mockImplementation(
        (params) => {
          return Promise.resolve({
            ...mockSolicitudConPlazo,
            ...params.data,
          });
        }
      );

      // Act
      const result = await service.aprobarSolicitud(
        mockSolicitudId,
        mockAgenteId,
        6,
        "Aprobado"
      );

      // Assert
      expect(result.fechaApertura).toEqual(currentDate);
      expect(result.fechaVencimiento).toEqual(expectedFechaVencimiento);
      expect(prismaMock.solicitudCDT.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fechaApertura: currentDate,
            fechaVencimiento: expectedFechaVencimiento,
          }),
        })
      );

      jest.useRealTimers();
    });

    it("should handle month rollover correctly when calculating fechaVencimiento", async () => {
      // Arrange
      const currentDate = new Date("2023-12-15");
      jest.useFakeTimers().setSystemTime(currentDate);

      const mockSolicitudConPlazo = {
        ...mockSolicitud,
        plazoMeses: 3,
      };

      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        mockSolicitudConPlazo
      );

      const expectedFechaVencimiento = new Date("2024-03-15"); // 3 meses después, cruzando año

      (prismaMock.solicitudCDT.update as jest.Mock).mockImplementation(
        (params) => {
          return Promise.resolve({
            ...mockSolicitudConPlazo,
            ...params.data,
          });
        }
      );

      // Act
      const result = await service.aprobarSolicitud(
        mockSolicitudId,
        mockAgenteId,
        6,
        "Aprobado"
      );

      // Assert
      expect(result.fechaApertura).toEqual(currentDate);
      expect(result.fechaVencimiento).toEqual(expectedFechaVencimiento);
      expect(prismaMock.solicitudCDT.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fechaApertura: currentDate,
            fechaVencimiento: expectedFechaVencimiento,
          }),
        })
      );

      jest.useRealTimers();
    });

    it("should handle large month values correctly when calculating fechaVencimiento", async () => {
      // Arrange
      const currentDate = new Date("2023-12-15");
      jest.useFakeTimers().setSystemTime(currentDate);

      const mockSolicitudConPlazoLargo = {
        ...mockSolicitud,
        plazoMeses: 36, // 3 años
      };

      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        mockSolicitudConPlazoLargo
      );

      const expectedFechaVencimiento = new Date("2026-12-15"); // 36 meses después

      (prismaMock.solicitudCDT.update as jest.Mock).mockImplementation(
        (params) => {
          return Promise.resolve({
            ...mockSolicitudConPlazoLargo,
            ...params.data,
          });
        }
      );

      // Act
      const result = await service.aprobarSolicitud(
        mockSolicitudId,
        mockAgenteId,
        6,
        "Aprobado"
      );

      // Assert
      expect(result.fechaApertura).toEqual(currentDate);
      expect(result.fechaVencimiento).toEqual(expectedFechaVencimiento);
      expect(prismaMock.solicitudCDT.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fechaApertura: currentDate,
            fechaVencimiento: expectedFechaVencimiento,
          }),
        })
      );

      jest.useRealTimers();
    });

    it("should handle extremely large month values that cause year overflow", async () => {
      // Arrange
      const currentDate = new Date("2023-12-15");
      jest.useFakeTimers().setSystemTime(currentDate);

      const mockSolicitudConPlazoExtremo = {
        ...mockSolicitud,
        plazoMeses: 1200, // 100 años
      };

      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        mockSolicitudConPlazoExtremo
      );

      const expectedFechaVencimiento = new Date("2123-12-15"); // 100 años después

      (prismaMock.solicitudCDT.update as jest.Mock).mockImplementation(
        (params) => {
          return Promise.resolve({
            ...mockSolicitudConPlazoExtremo,
            ...params.data,
          });
        }
      );

      // Act
      const result = await service.aprobarSolicitud(
        mockSolicitudId,
        mockAgenteId,
        6,
        "Aprobado"
      );

      // Assert
      expect(result.fechaApertura).toEqual(currentDate);
      expect(result.fechaVencimiento).toEqual(expectedFechaVencimiento);
      expect(prismaMock.solicitudCDT.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fechaApertura: currentDate,
            fechaVencimiento: expectedFechaVencimiento,
          }),
        })
      );

      jest.useRealTimers();
    });

    it("should handle month and year transitions correctly", async () => {
      // Arrange
      const currentDate = new Date("2023-01-31"); // Último día de enero
      jest.useFakeTimers().setSystemTime(currentDate);

      const mockSolicitudConPlazo = {
        ...mockSolicitud,
        plazoMeses: 1, // 1 mes para probar transición específica
      };

      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        mockSolicitudConPlazo
      );

      // La fecha de vencimiento será el 3 de marzo debido a cómo JavaScript maneja
      // el cambio de meses cuando el día es mayor que el número de días en el mes destino
      const expectedFechaVencimiento = new Date("2023-03-03");

      (prismaMock.solicitudCDT.update as jest.Mock).mockImplementation(
        (params) => {
          return Promise.resolve({
            ...mockSolicitudConPlazo,
            ...params.data,
          });
        }
      );

      // Act
      const result = await service.aprobarSolicitud(
        mockSolicitudId,
        mockAgenteId,
        6,
        "Aprobado"
      );

      // Assert
      expect(result.fechaApertura).toEqual(currentDate);
      expect(result.fechaVencimiento).toEqual(expectedFechaVencimiento);
      expect(prismaMock.solicitudCDT.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fechaApertura: currentDate,
            fechaVencimiento: expectedFechaVencimiento,
          }),
        })
      );

      jest.useRealTimers();
    });

    it("should keep existing tasa interes when not provided in approval", async () => {
      // Arrange
      const existingTasaInteres = 5;
      const mockSolicitudConTasa = {
        ...mockSolicitud,
        tasaInteres: existingTasaInteres,
      };

      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        mockSolicitudConTasa
      );

      (prismaMock.solicitudCDT.update as jest.Mock).mockImplementation(
        (params) => {
          return Promise.resolve({
            ...mockSolicitudConTasa,
            ...params.data,
          });
        }
      );

      // Act
      const result = await service.aprobarSolicitud(
        mockSolicitudId,
        mockAgenteId,
        undefined,
        "Aprobado sin cambio de tasa"
      );

      // Assert
      expect(result.tasaInteres).toEqual(existingTasaInteres);
      expect(prismaMock.solicitudCDT.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tasaInteres: existingTasaInteres,
          }),
        })
      );
    });

    it("should throw error if solicitud is not found", async () => {
      // Arrange
      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        null
      );

      // Act & Assert
      await expect(
        service.aprobarSolicitud(mockSolicitudId, mockAgenteId)
      ).rejects.toThrow("Solicitud no encontrada");
    });

    it("should throw error if solicitud is not in EN_VALIDACION state", async () => {
      // Arrange
      const invalidSolicitud = {
        ...mockSolicitud,
        estado: "BORRADOR" as EstadoSolicitud,
      };
      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        invalidSolicitud
      );

      // Act & Assert
      await expect(
        service.aprobarSolicitud(mockSolicitudId, mockAgenteId)
      ).rejects.toThrow(
        "Solo se pueden aprobar solicitudes en estado EN_VALIDACION"
      );
    });
  });

  describe("rechazarSolicitud", () => {
    const mockSolicitud = {
      id: mockSolicitudId,
      estado: "EN_VALIDACION" as EstadoSolicitud,
    };

    it("should reject solicitud successfully", async () => {
      // Arrange
      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        mockSolicitud
      );

      const mockUpdatedSolicitud = {
        ...mockSolicitud,
        estado: "RECHAZADA",
        motivoRechazo: "Documentación incompleta",
      };

      (prismaMock.solicitudCDT.update as jest.Mock).mockResolvedValueOnce(
        mockUpdatedSolicitud
      );
      (prismaMock.historialEstado.create as jest.Mock).mockResolvedValueOnce(
        {}
      );

      // Act
      const result = await service.rechazarSolicitud(
        mockSolicitudId,
        mockAgenteId,
        "Documentación incompleta"
      );

      // Assert
      expect(result).toEqual(mockUpdatedSolicitud);
      expect(prismaMock.historialEstado.create).toHaveBeenCalledWith({
        data: {
          solicitudId: mockSolicitudId,
          estadoAnterior: "EN_VALIDACION",
          estadoNuevo: "RECHAZADA",
          observaciones: "Documentación incompleta",
          cambiadoPor: mockAgenteId,
        },
      });
    });

    it("should throw error if solicitud is not found", async () => {
      // Arrange
      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        null
      );

      // Act & Assert
      await expect(
        service.rechazarSolicitud(mockSolicitudId, mockAgenteId, "Motivo")
      ).rejects.toThrow("Solicitud no encontrada");
    });

    it("should throw error if solicitud is not in EN_VALIDACION state", async () => {
      // Arrange
      const invalidSolicitud = {
        ...mockSolicitud,
        estado: "BORRADOR" as EstadoSolicitud,
      };
      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        invalidSolicitud
      );

      // Act & Assert
      await expect(
        service.rechazarSolicitud(mockSolicitudId, mockAgenteId, "Motivo")
      ).rejects.toThrow(
        "Solo se pueden rechazar solicitudes en estado EN_VALIDACION"
      );
    });
  });

  describe("getSolicitudById", () => {
    const mockSolicitud = {
      id: mockSolicitudId,
      estado: "EN_VALIDACION" as EstadoSolicitud,
      cliente: {
        nombres: "John",
        apellidos: "Doe",
        numeroDocumento: "123456789",
        telefono: "1234567890",
        usuario: {
          email: "john@example.com",
        },
      },
    };

    it("should return solicitud with client details", async () => {
      // Arrange
      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        mockSolicitud
      );

      // Act
      const result = await service.getSolicitudById(mockSolicitudId);

      // Assert
      expect(result).toEqual(mockSolicitud);
      expect(prismaMock.solicitudCDT.findUnique).toHaveBeenCalledWith({
        where: { id: mockSolicitudId },
        include: {
          cliente: {
            select: {
              nombres: true,
              apellidos: true,
              numeroDocumento: true,
              telefono: true,
              usuario: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    it("should throw error if solicitud is not found", async () => {
      // Arrange
      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        null
      );

      // Act & Assert
      await expect(service.getSolicitudById(mockSolicitudId)).rejects.toThrow(
        "Solicitud no encontrada"
      );
    });
  });

  describe("getHistorialSolicitud", () => {
    const mockHistorial = [
      {
        id: "historial-1",
        solicitudId: mockSolicitudId,
        estadoAnterior: "BORRADOR",
        estadoNuevo: "EN_VALIDACION",
        observaciones: "Enviado a validación",
        cambiadoPor: "user-123",
        createdAt: new Date(),
      },
    ];

    it("should return historial for solicitud", async () => {
      // Arrange
      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockSolicitudId,
      });
      (prismaMock.historialEstado.findMany as jest.Mock).mockResolvedValueOnce(
        mockHistorial
      );

      // Act
      const result = await service.getHistorialSolicitud(mockSolicitudId);

      // Assert
      expect(result).toEqual(mockHistorial);
      expect(prismaMock.historialEstado.findMany).toHaveBeenCalledWith({
        where: { solicitudId: mockSolicitudId },
        orderBy: { createdAt: "asc" },
      });
    });

    it("should throw error if solicitud is not found", async () => {
      // Arrange
      (prismaMock.solicitudCDT.findUnique as jest.Mock).mockResolvedValueOnce(
        null
      );

      // Act & Assert
      await expect(
        service.getHistorialSolicitud(mockSolicitudId)
      ).rejects.toThrow("Solicitud no encontrada");
      expect(prismaMock.historialEstado.findMany).not.toHaveBeenCalled();
    });
  });
});
