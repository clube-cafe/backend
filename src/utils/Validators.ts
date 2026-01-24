/**
 * Validadores centralizados para garantir consistência e reutilização
 */

export class Validators {
  /**
   * Valida se é um email válido
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida se é um UUID válido
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Valida se é uma data válida
   */
  static isValidDate(date: Date | string): boolean {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }

  /**
   * Valida se é um valor monetário válido
   */
  static isValidMoney(value: number): boolean {
    return typeof value === "number" && value > 0 && Number.isFinite(value);
  }

  /**
   * Valida string não vazia e com comprimento mínimo
   */
  static isValidString(value: string, minLength: number = 1, maxLength?: number): boolean {
    if (typeof value !== "string" || value.trim().length < minLength) {
      return false;
    }
    if (maxLength && value.length > maxLength) {
      return false;
    }
    return true;
  }

  /**
   * Valida dia do mês (1-31)
   */
  static isValidDay(day: number): boolean {
    return Number.isInteger(day) && day >= 1 && day <= 31;
  }

  /**
   * Valida hora (0-23)
   */
  static isValidHour(hour: number): boolean {
    return Number.isInteger(hour) && hour >= 0 && hour <= 23;
  }

  /**
   * Valida minuto (0-59)
   */
  static isValidMinute(minute: number): boolean {
    return Number.isInteger(minute) && minute >= 0 && minute <= 59;
  }

  /**
   * Sanitiza string removendo caracteres especiais perigosos
   */
  static sanitizeString(value: string): string {
    return value.trim().replace(/[<>]/g, "");
  }
}
