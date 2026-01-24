import { AppError, ValidationError, NotFoundError, UnauthorizedError, ConflictError, InternalServerError } from '../../src/utils/Errors';

describe('Custom Errors', () => {
  describe('AppError', () => {
    it('deve criar erro base com mensagem e status', () => {
      const error = new AppError(418, 'Erro customizado');
      expect(error.message).toBe('Erro customizado');
      expect(error.statusCode).toBe(418);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ValidationError', () => {
    it('deve criar erro de validação com status 400', () => {
      const error = new ValidationError('Campo inválido');
      expect(error.message).toBe('Campo inválido');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('NotFoundError', () => {
    it('deve criar erro de não encontrado com status 404', () => {
      const error = new NotFoundError('Recurso');
      expect(error.message).toBe('Recurso não encontrado(a)');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('UnauthorizedError', () => {
    it('deve criar erro de não autorizado com status 401', () => {
      const error = new UnauthorizedError('Acesso negado');
      expect(error.message).toBe('Acesso negado');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ConflictError', () => {
    it('deve criar erro de conflito com status 409', () => {
      const error = new ConflictError('Registro duplicado');
      expect(error.message).toBe('Registro duplicado');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('InternalServerError', () => {
    it('deve criar erro interno com status 500', () => {
      const error = new InternalServerError('Erro no servidor');
      expect(error.message).toBe('Erro no servidor');
      expect(error.statusCode).toBe(500);
    });
  });
});
