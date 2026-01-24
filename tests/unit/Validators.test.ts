import { Validators } from '../../src/utils/Validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('deve validar emails corretos', () => {
      expect(Validators.isValidEmail('user@example.com')).toBe(true);
      expect(Validators.isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    it('deve rejeitar emails inválidos', () => {
      expect(Validators.isValidEmail('invalid')).toBe(false);
      expect(Validators.isValidEmail('user@')).toBe(false);
      expect(Validators.isValidEmail('@domain.com')).toBe(false);
      expect(Validators.isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('deve validar UUIDs corretos', () => {
      expect(Validators.isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(Validators.isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('deve rejeitar UUIDs inválidos', () => {
      expect(Validators.isValidUUID('invalid-uuid')).toBe(false);
      expect(Validators.isValidUUID('123')).toBe(false);
      expect(Validators.isValidUUID('')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('deve validar datas corretas', () => {
      expect(Validators.isValidDate('2026-01-24')).toBe(true);
      expect(Validators.isValidDate('2000-12-31')).toBe(true);
    });

    it('deve rejeitar datas inválidas', () => {
      expect(Validators.isValidDate('invalid-date')).toBe(false);
      expect(Validators.isValidDate('2026-13-01')).toBe(false);
      expect(Validators.isValidDate('24/01/2026')).toBe(false);
      expect(Validators.isValidDate('')).toBe(false);
    });
  });

  describe('isValidMoney', () => {
    it('deve validar valores monetários corretos', () => {
      expect(Validators.isValidMoney(100)).toBe(true);
      expect(Validators.isValidMoney(50.5)).toBe(true);
      expect(Validators.isValidMoney(0.01)).toBe(true);
    });

    it('deve rejeitar valores monetários inválidos', () => {
      expect(Validators.isValidMoney(-10)).toBe(false);
      expect(Validators.isValidMoney(0)).toBe(false);
      expect(Validators.isValidMoney(NaN)).toBe(false);
    });
  });

  describe('isValidString', () => {
    it('deve validar strings corretas', () => {
      expect(Validators.isValidString('texto válido')).toBe(true);
      expect(Validators.isValidString('a')).toBe(true);
    });

    it('deve rejeitar strings inválidas', () => {
      expect(Validators.isValidString('')).toBe(false);
      expect(Validators.isValidString('   ')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('deve remover caracteres perigosos', () => {
      const sanitized = Validators.sanitizeString('<script>alert("xss")</script>');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('deve fazer trim de espaços', () => {
      expect(Validators.sanitizeString('  texto  ')).toBe('texto');
    });

    it('deve manter texto limpo', () => {
      expect(Validators.sanitizeString('Texto normal')).toBe('Texto normal');
    });
  });
});
