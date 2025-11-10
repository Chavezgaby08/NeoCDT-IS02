import "@jest/globals";
import { SolicitudService } from "../../../src/services/solicitudService";
import { prismaMock } from "../../_mocks_/prismaClient";
import { EstadoSolicitud } from "@prisma/client";

jest.mock("@prisma/client");

describe("SolicitudService", () => {
  let service: SolicitudService;
  const mockUsuarioId = "user-123";
  const mockClienteId = "client-123";
  const mockSolicitudId = "solicitud-123";

  beforeEach(() => {
    service = new SolicitudService();
    jest.clearAllMocks();
  });

  describe("getSolicitudes", () => {
    it("should return all solicitudes for a client", async () => {
      // Arrange
      const mockSolicitudes = [
        {
          id: "solicitud-1",
          clienteId: mockClienteId,
          monto: 1000000,
          plazoMeses: 12,
          tasaInteres: 5,
          estado: "BORRADOR" as EstadoSolicitud,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockClienteId,
        usuarioId: mockUsuarioId,
      });

      (prismaMock.solicitudCDT.findMany as jest.Mock).mockResolvedValueOnce(
        mockSolicitudes
      );

      // Act
      const result = await service.getSolicitudes(mockUsuarioId);

      // Assert
      expect(result).toEqual(mockSolicitudes);
      expect(prismaMock.cliente.findUnique).toHaveBeenCalledWith({
        where: { usuarioId: mockUsuarioId },
      });
      expect(prismaMock.solicitudCDT.findMany).toHaveBeenCalledWith({
        where: { clienteId: mockClienteId },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should throw error if client is not found", async () => {
      // Arrange
      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.getSolicitudes(mockUsuarioId)).rejects.toThrow(
        "Cliente no encontrado"
      );
      expect(prismaMock.solicitudCDT.findMany).not.toHaveBeenCalled();
    });
  });

  describe("getSolicitudById", () => {
    const mockSolicitud = {
      id: mockSolicitudId,
      clienteId: mockClienteId,
      monto: 1000000,
      plazoMeses: 12,
      tasaInteres: 5,
      estado: "BORRADOR" as EstadoSolicitud,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should return solicitud by id", async () => {
      // Arrange
      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockClienteId,
        usuarioId: mockUsuarioId,
      });

      (prismaMock.solicitudCDT.findFirst as jest.Mock).mockResolvedValueOnce(
        mockSolicitud
      );

      // Act
      const result = await service.getSolicitudById(
        mockSolicitudId,
        mockUsuarioId
      );

      // Assert
      expect(result).toEqual(mockSolicitud);
      expect(prismaMock.solicitudCDT.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockSolicitudId,
          clienteId: mockClienteId,
        },
      });
    });

    it("should throw error if client is not found", async () => {
      // Arrange
      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.getSolicitudById(mockSolicitudId, mockUsuarioId)
      ).rejects.toThrow("Cliente no encontrado");
      expect(prismaMock.solicitudCDT.findFirst).not.toHaveBeenCalled();
    });

    it("should throw error if solicitud is not found", async () => {
      // Arrange
      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockClienteId,
        usuarioId: mockUsuarioId,
      });
      (prismaMock.solicitudCDT.findFirst as jest.Mock).mockResolvedValueOnce(
        null
      );

      // Act & Assert
      await expect(
        service.getSolicitudById(mockSolicitudId, mockUsuarioId)
      ).rejects.toThrow("Solicitud no encontrada");
    });
  });

  describe("createSolicitud", () => {
    const mockCreateData = {
      monto: 1000000,
      plazoMeses: 12,
      tasaInteres: 5,
    };

    it("should create new solicitud", async () => {
      // Arrange
      const mockNewSolicitud = {
        id: mockSolicitudId,
        clienteId: mockClienteId,
        ...mockCreateData,
        estado: "BORRADOR",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockClienteId,
        usuarioId: mockUsuarioId,
      });

      (prismaMock.solicitudCDT.create as jest.Mock).mockResolvedValueOnce(
        mockNewSolicitud
      );
      (prismaMock.historialEstado.create as jest.Mock).mockResolvedValueOnce(
        {}
      );

      // Act
      const result = await service.createSolicitud(
        mockCreateData,
        mockUsuarioId
      );

      // Assert
      expect(result).toEqual(mockNewSolicitud);
      expect(prismaMock.solicitudCDT.create).toHaveBeenCalledWith({
        data: {
          clienteId: mockClienteId,
          monto: mockCreateData.monto,
          plazoMeses: mockCreateData.plazoMeses,
          tasaInteres: mockCreateData.tasaInteres,
          estado: "BORRADOR",
        },
      });
      expect(prismaMock.historialEstado.create).toHaveBeenCalledWith({
        data: {
          solicitudId: mockSolicitudId,
          estadoNuevo: "BORRADOR",
          observaciones: "Solicitud creada",
          cambiadoPor: mockUsuarioId,
        },
      });
    });

    it("should create solicitud with default tasa interes when not provided", async () => {
      // Arrange
      const dataWithoutTasa = {
        monto: 1000000,
        plazoMeses: 12,
      };

      const mockNewSolicitud = {
        id: mockSolicitudId,
        clienteId: mockClienteId,
        ...dataWithoutTasa,
        tasaInteres: 0,
        estado: "BORRADOR",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockClienteId,
        usuarioId: mockUsuarioId,
      });

      (prismaMock.solicitudCDT.create as jest.Mock).mockResolvedValueOnce(
        mockNewSolicitud
      );
      (prismaMock.historialEstado.create as jest.Mock).mockResolvedValueOnce(
        {}
      );

      // Act
      const result = await service.createSolicitud(
        dataWithoutTasa,
        mockUsuarioId
      );

      // Assert
      expect(result).toEqual(mockNewSolicitud);
      expect(prismaMock.solicitudCDT.create).toHaveBeenCalledWith({
        data: {
          clienteId: mockClienteId,
          monto: dataWithoutTasa.monto,
          plazoMeses: dataWithoutTasa.plazoMeses,
          tasaInteres: 0,
          estado: "BORRADOR",
        },
      });
    });

    it("should throw error if client is not found", async () => {
      // Arrange
      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.createSolicitud(mockCreateData, mockUsuarioId)
      ).rejects.toThrow("Cliente no encontrado");
      expect(prismaMock.solicitudCDT.create).not.toHaveBeenCalled();
      expect(prismaMock.historialEstado.create).not.toHaveBeenCalled();
    });
  });

  describe("updateSolicitud", () => {
    const mockUpdateData = {
      monto: 2000000,
      plazoMeses: 24,
      estado: "EN_VALIDACION" as EstadoSolicitud,
    };

    const mockExistingSolicitud = {
      id: mockSolicitudId,
      clienteId: mockClienteId,
      monto: 1000000,
      plazoMeses: 12,
      tasaInteres: 5,
      estado: "BORRADOR" as EstadoSolicitud,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should update solicitud", async () => {
      // Arrange
      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockClienteId,
        usuarioId: mockUsuarioId,
      });

      (prismaMock.solicitudCDT.findFirst as jest.Mock).mockResolvedValueOnce(
        mockExistingSolicitud
      );

      const mockUpdatedSolicitud = {
        ...mockExistingSolicitud,
        ...mockUpdateData,
      };

      (prismaMock.solicitudCDT.update as jest.Mock).mockResolvedValueOnce(
        mockUpdatedSolicitud
      );
      (prismaMock.historialEstado.create as jest.Mock).mockResolvedValueOnce(
        {}
      );

      // Act
      const result = await service.updateSolicitud(
        mockSolicitudId,
        mockUpdateData,
        mockUsuarioId
      );

      // Assert
      expect(result).toEqual(mockUpdatedSolicitud);
      expect(prismaMock.solicitudCDT.update).toHaveBeenCalledWith({
        where: { id: mockSolicitudId },
        data: mockUpdateData,
      });
      expect(prismaMock.historialEstado.create).toHaveBeenCalledWith({
        data: {
          solicitudId: mockSolicitudId,
          estadoAnterior: "BORRADOR",
          estadoNuevo: "EN_VALIDACION",
          observaciones: "Estado actualizado",
          cambiadoPor: mockUsuarioId,
        },
      });
    });

    it("should add fechaApertura when approving solicitud", async () => {
      // Arrange
      const approveData = {
        estado: "APROBADA" as EstadoSolicitud,
        tasaInteres: 5,
      };

      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockClienteId,
        usuarioId: mockUsuarioId,
      });

      (prismaMock.solicitudCDT.findFirst as jest.Mock).mockResolvedValueOnce(
        mockExistingSolicitud
      );

      const mockApprovedSolicitud = {
        ...mockExistingSolicitud,
        ...approveData,
        fechaApertura: expect.any(Date),
      };

      (prismaMock.solicitudCDT.update as jest.Mock).mockResolvedValueOnce(
        mockApprovedSolicitud
      );
      (prismaMock.historialEstado.create as jest.Mock).mockResolvedValueOnce(
        {}
      );

      // Act
      const result = await service.updateSolicitud(
        mockSolicitudId,
        approveData,
        mockUsuarioId
      );

      // Assert
      expect(result).toEqual(mockApprovedSolicitud);
      expect(prismaMock.solicitudCDT.update).toHaveBeenCalledWith({
        where: { id: mockSolicitudId },
        data: {
          ...approveData,
          fechaApertura: expect.any(Date),
        },
      });
    });

    it("should update motivoRechazo when rejecting solicitud", async () => {
      // Arrange
      const rejectData = {
        estado: "RECHAZADA" as EstadoSolicitud,
        motivoRechazo: "No cumple requisitos mínimos",
      };

      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockClienteId,
        usuarioId: mockUsuarioId,
      });

      (prismaMock.solicitudCDT.findFirst as jest.Mock).mockResolvedValueOnce(
        mockExistingSolicitud
      );

      const mockRejectedSolicitud = {
        ...mockExistingSolicitud,
        ...rejectData,
      };

      (prismaMock.solicitudCDT.update as jest.Mock).mockResolvedValueOnce(
        mockRejectedSolicitud
      );
      (prismaMock.historialEstado.create as jest.Mock).mockResolvedValueOnce(
        {}
      );

      // Act
      const result = await service.updateSolicitud(
        mockSolicitudId,
        rejectData,
        mockUsuarioId
      );

      // Assert
      expect(result).toEqual(mockRejectedSolicitud);
      expect(prismaMock.solicitudCDT.update).toHaveBeenCalledWith({
        where: { id: mockSolicitudId },
        data: rejectData,
      });
      expect(prismaMock.historialEstado.create).toHaveBeenCalledWith({
        data: {
          solicitudId: mockSolicitudId,
          estadoAnterior: "BORRADOR",
          estadoNuevo: "RECHAZADA",
          observaciones: "No cumple requisitos mínimos",
          cambiadoPor: mockUsuarioId,
        },
      });
    });

    it("should throw error if client is not found", async () => {
      // Arrange
      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.updateSolicitud(mockSolicitudId, mockUpdateData, mockUsuarioId)
      ).rejects.toThrow("Cliente no encontrado");
      expect(prismaMock.solicitudCDT.update).not.toHaveBeenCalled();
      expect(prismaMock.historialEstado.create).not.toHaveBeenCalled();
    });

    it("should throw error if solicitud is not found", async () => {
      // Arrange
      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockClienteId,
        usuarioId: mockUsuarioId,
      });
      (prismaMock.solicitudCDT.findFirst as jest.Mock).mockResolvedValueOnce(
        null
      );

      // Act & Assert
      await expect(
        service.updateSolicitud(mockSolicitudId, mockUpdateData, mockUsuarioId)
      ).rejects.toThrow("Solicitud no encontrada");
      expect(prismaMock.solicitudCDT.update).not.toHaveBeenCalled();
      expect(prismaMock.historialEstado.create).not.toHaveBeenCalled();
    });
  });

  describe("deleteSolicitud", () => {
    it("should delete solicitud", async () => {
      // Arrange
      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockClienteId,
        usuarioId: mockUsuarioId,
      });

      (prismaMock.solicitudCDT.findFirst as jest.Mock).mockResolvedValueOnce({
        id: mockSolicitudId,
        clienteId: mockClienteId,
      });

      (prismaMock.solicitudCDT.delete as jest.Mock).mockResolvedValueOnce({});

      // Act
      const result = await service.deleteSolicitud(
        mockSolicitudId,
        mockUsuarioId
      );

      // Assert
      expect(result).toEqual({
        success: true,
        message: "Solicitud eliminada",
      });
      expect(prismaMock.solicitudCDT.delete).toHaveBeenCalledWith({
        where: { id: mockSolicitudId },
      });
    });

    it("should throw error if client is not found", async () => {
      // Arrange
      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.deleteSolicitud(mockSolicitudId, mockUsuarioId)
      ).rejects.toThrow("Cliente no encontrado");
      expect(prismaMock.solicitudCDT.delete).not.toHaveBeenCalled();
    });

    it("should throw error if solicitud is not found", async () => {
      // Arrange
      (prismaMock.cliente.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockClienteId,
        usuarioId: mockUsuarioId,
      });
      (prismaMock.solicitudCDT.findFirst as jest.Mock).mockResolvedValueOnce(
        null
      );

      // Act & Assert
      await expect(
        service.deleteSolicitud(mockSolicitudId, mockUsuarioId)
      ).rejects.toThrow("Solicitud no encontrada");
      expect(prismaMock.solicitudCDT.delete).not.toHaveBeenCalled();
    });
  });
});
