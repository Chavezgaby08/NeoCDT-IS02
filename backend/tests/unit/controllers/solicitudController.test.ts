import { Response } from "express";
import { SolicitudController } from "../../../src/controllers/solicitudController";
import { SolicitudService } from "../../../src/services/solicitudService";
import { AuthRequest } from "../../../src/types";

jest.mock("../../../src/services/solicitudService");

describe("SolicitudController", () => {
  let solicitudController: SolicitudController;
  let mockSolicitudService: jest.Mocked<SolicitudService>;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockSolicitudService =
      new SolicitudService() as jest.Mocked<SolicitudService>;
    mockSolicitudService.getSolicitudes = jest.fn();
    mockSolicitudService.getSolicitudById = jest.fn();
    mockSolicitudService.createSolicitud = jest.fn();
    mockSolicitudService.updateSolicitud = jest.fn();
    mockSolicitudService.deleteSolicitud = jest.fn();

    jest
      .spyOn(SolicitudService.prototype, "getSolicitudes")
      .mockImplementation(mockSolicitudService.getSolicitudes);
    jest
      .spyOn(SolicitudService.prototype, "getSolicitudById")
      .mockImplementation(mockSolicitudService.getSolicitudById);
    jest
      .spyOn(SolicitudService.prototype, "createSolicitud")
      .mockImplementation(mockSolicitudService.createSolicitud);
    jest
      .spyOn(SolicitudService.prototype, "updateSolicitud")
      .mockImplementation(mockSolicitudService.updateSolicitud);
    jest
      .spyOn(SolicitudService.prototype, "deleteSolicitud")
      .mockImplementation(mockSolicitudService.deleteSolicitud);

    solicitudController = new SolicitudController();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("debe obtener todas las solicitudes exitosamente", async () => {
      const mockSolicitudes = [
        {
          id: "1",
          clienteId: "cliente-1",
          monto: 100000 as any,
          plazoMeses: 12,
          tasaInteres: 5.5 as any,
          estado: "BORRADOR" as any,
          motivoRechazo: null,
          fechaApertura: null,
          fechaVencimiento: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          clienteId: "cliente-1",
          monto: 200000 as any,
          plazoMeses: 24,
          tasaInteres: 6.0 as any,
          estado: "APROBADA" as any,
          motivoRechazo: null,
          fechaApertura: new Date(),
          fechaVencimiento: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockSolicitudService.getSolicitudes.mockResolvedValue(
        mockSolicitudes as any
      );

      mockRequest = {
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.getAll(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockSolicitudService.getSolicitudes).toHaveBeenCalledWith(
        "user-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSolicitudes);
    });

    it("debe manejar errores al obtener solicitudes", async () => {
      const errorMessage = "Error al obtener solicitudes";
      mockSolicitudService.getSolicitudes.mockRejectedValue(
        new Error(errorMessage)
      );

      mockRequest = {
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.getAll(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("debe manejar errores genéricos en getAll", async () => {
      mockSolicitudService.getSolicitudes.mockRejectedValue(new Error());

      mockRequest = {
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.getAll(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Error al obtener solicitudes",
      });
    });
  });

  describe("getById", () => {
    it("debe obtener una solicitud por ID exitosamente", async () => {
      const mockSolicitud = {
        id: "1",
        clienteId: "cliente-1",
        monto: 100000 as any,
        plazoMeses: 12,
        tasaInteres: 5.5 as any,
        estado: "BORRADOR" as any,
        motivoRechazo: null,
        fechaApertura: null,
        fechaVencimiento: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSolicitudService.getSolicitudById.mockResolvedValue(
        mockSolicitud as any
      );

      mockRequest = {
        params: { id: "1" },
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.getById(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockSolicitudService.getSolicitudById).toHaveBeenCalledWith(
        "1",
        "user-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSolicitud);
    });

    it("debe manejar solicitud no encontrada", async () => {
      const errorMessage = "Solicitud no encontrada";
      mockSolicitudService.getSolicitudById.mockRejectedValue(
        new Error(errorMessage)
      );

      mockRequest = {
        params: { id: "1" },
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.getById(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("debe manejar errores genéricos en getById", async () => {
      mockSolicitudService.getSolicitudById.mockRejectedValue(new Error());

      mockRequest = {
        params: { id: "1" },
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.getById(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Solicitud no encontrada",
      });
    });
  });

  describe("create", () => {
    const validSolicitudData = {
      monto: 150000,
      plazoMeses: 12,
      tasaInteres: 5.5,
    };

    it("debe crear una solicitud exitosamente", async () => {
      const mockSolicitud = {
        id: "1",
        clienteId: "cliente-1",
        monto: 150000 as any,
        plazoMeses: 12,
        tasaInteres: 5.5 as any,
        estado: "BORRADOR" as any,
        motivoRechazo: null,
        fechaApertura: null,
        fechaVencimiento: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSolicitudService.createSolicitud.mockResolvedValue(
        mockSolicitud as any
      );

      mockRequest = {
        body: validSolicitudData,
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.create(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockSolicitudService.createSolicitud).toHaveBeenCalledWith(
        validSolicitudData,
        "user-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSolicitud);
    });

    it("debe manejar errores al crear solicitud", async () => {
      const errorMessage = "Error al crear solicitud";
      mockSolicitudService.createSolicitud.mockRejectedValue(
        new Error(errorMessage)
      );

      mockRequest = {
        body: validSolicitudData,
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.create(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("debe manejar errores genéricos en create", async () => {
      mockSolicitudService.createSolicitud.mockRejectedValue(new Error());

      mockRequest = {
        body: validSolicitudData,
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.create(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Error al crear solicitud",
      });
    });
  });

  describe("update", () => {
    const updateData = {
      monto: 200000,
      plazoMeses: 24,
    };

    it("debe actualizar una solicitud exitosamente", async () => {
      const mockSolicitud = {
        id: "1",
        clienteId: "cliente-1",
        monto: 200000 as any,
        plazoMeses: 24,
        tasaInteres: 5.5 as any,
        estado: "BORRADOR" as any,
        motivoRechazo: null,
        fechaApertura: null,
        fechaVencimiento: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSolicitudService.updateSolicitud.mockResolvedValue(
        mockSolicitud as any
      );

      mockRequest = {
        params: { id: "1" },
        body: updateData,
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.update(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockSolicitudService.updateSolicitud).toHaveBeenCalledWith(
        "1",
        updateData,
        "user-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSolicitud);
    });

    it("debe manejar errores al actualizar solicitud", async () => {
      const errorMessage = "Error al actualizar solicitud";
      mockSolicitudService.updateSolicitud.mockRejectedValue(
        new Error(errorMessage)
      );

      mockRequest = {
        params: { id: "1" },
        body: updateData,
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.update(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("debe manejar errores genéricos en update", async () => {
      mockSolicitudService.updateSolicitud.mockRejectedValue(new Error());

      mockRequest = {
        params: { id: "1" },
        body: updateData,
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.update(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Error al actualizar solicitud",
      });
    });
  });

  describe("delete", () => {
    it("debe eliminar una solicitud exitosamente", async () => {
      const mockResult = {
        success: true,
        message: "Solicitud eliminada exitosamente",
      };
      mockSolicitudService.deleteSolicitud.mockResolvedValue(mockResult as any);

      mockRequest = {
        params: { id: "1" },
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.delete(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockSolicitudService.deleteSolicitud).toHaveBeenCalledWith(
        "1",
        "user-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("debe manejar errores al eliminar solicitud", async () => {
      const errorMessage = "Error al eliminar solicitud";
      mockSolicitudService.deleteSolicitud.mockRejectedValue(
        new Error(errorMessage)
      );

      mockRequest = {
        params: { id: "1" },
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.delete(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("debe manejar errores genéricos en delete", async () => {
      mockSolicitudService.deleteSolicitud.mockRejectedValue(new Error());

      mockRequest = {
        params: { id: "1" },
        user: {
          id: "user-1",
          email: "test@example.com",
          rol: "CLIENTE" as any,
        },
      };

      await solicitudController.delete(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Error al eliminar solicitud",
      });
    });
  });
});
