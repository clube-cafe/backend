import { Logger } from '../../src/utils/Logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('info', () => {
    it('deve logar mensagens info', () => {
      Logger.info('Mensagem de teste');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy.mock.calls[0][0]).toContain('[INFO]');
      expect(consoleLogSpy.mock.calls[0][0]).toContain('Mensagem de teste');
    });
  });

  describe('error', () => {
    it('deve logar erros', () => {
      const error = new Error('Erro de teste');
      Logger.error('Erro ocorreu', error);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('[ERROR]');
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Erro ocorreu');
    });
  });

  describe('warn', () => {
    it('deve logar avisos', () => {
      Logger.warn('Aviso de teste');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('[WARN]');
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('Aviso de teste');
    });
  });

  describe('debug', () => {
    it('não deve logar quando DEBUG não está habilitado', () => {
      Logger.debug('Debug de teste');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('deve logar quando DEBUG está habilitado', () => {
      process.env.DEBUG = 'true';
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
      Logger.debug('Debug de teste');
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      expect(consoleDebugSpy.mock.calls[0][0]).toContain('[DEBUG]');
      expect(consoleDebugSpy.mock.calls[0][0]).toContain('Debug de teste');
      consoleDebugSpy.mockRestore();
      delete process.env.DEBUG;
    });
  });
});
