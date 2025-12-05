import sequelize from "./database";
import { Transaction } from "sequelize";

export class TransactionHelper {
  static async executeTransaction<T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    const transaction = await sequelize.transaction();

    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async executeMultipleOperations<T>(
    operations: Array<(transaction: Transaction) => Promise<T>>
  ): Promise<T[]> {
    return this.executeTransaction(async (transaction) => {
      const results: T[] = [];

      for (const operation of operations) {
        const result = await operation(transaction);
        results.push(result);
      }

      return results;
    });
  }

  static async executeWithRetry<T>(
    callback: (transaction: Transaction) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeTransaction(callback);
      } catch (error: any) {
        lastError = error;

        if (
          error.message.includes("deadlock") ||
          error.message.includes("timeout") ||
          error.code === "40P01"
        ) {
          const delay = Math.pow(2, attempt) * 100;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error("Falha ao executar transação após múltiplas tentativas");
  }

  static async executeReadTransaction<T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    const transaction = await sequelize.transaction();

    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
