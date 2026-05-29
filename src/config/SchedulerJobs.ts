import cron, { type ScheduledTask } from "node-cron";
import { Op } from "sequelize";
import { PagamentoRepository } from "../repository/PagamentoRepository";
import { STATUS } from "../models/enums";
import { Pagamento } from "../models/Pagamento";
import { TokenBlacklist } from "../models/TokenBlacklist";
import { Logger } from "../utils/Logger";
import { TransactionHelper } from "./TransactionHelper";

const pagamentoRepository = new PagamentoRepository();

export class SchedulerJobs {
  private static tasks: ScheduledTask[] = [];

  static iniciarJobs() {
    this.tasks.push(this.jobMarcarAtrasados());
    this.tasks.push(this.jobLembreteVencimento());
    this.tasks.push(this.jobLimparBlacklist());
  }

  static pararJobs() {
    this.tasks.forEach((t) => t.stop());
    this.tasks = [];
  }

  private static jobMarcarAtrasados(): ScheduledTask {
    return cron.schedule("0 0 * * *", async () => {
      try {
        Logger.info("[CRON] Executando: Marcar pagamentos atrasados");

        const vencidos = await pagamentoRepository.getPagamentosVencidos();
        const pendentesParaAtualizar = vencidos.filter((p) => p.status === STATUS.PENDENTE);

        if (pendentesParaAtualizar.length > 0) {
          await TransactionHelper.executeTransaction(async (transaction) => {
            await Promise.all(
              pendentesParaAtualizar.map((pendente) =>
                pagamentoRepository.updateStatusPagamento(pendente.id, STATUS.ATRASADO, transaction)
              )
            );
          });
          Logger.info(`[CRON] ${pendentesParaAtualizar.length} pagamentos marcados como ATRASADO`);
        } else {
          Logger.info("[CRON] Nenhum pagamento atrasado encontrado");
        }
      } catch (error) {
        Logger.error("[CRON] Erro ao marcar atrasados", error);
      }
    });
  }

  private static jobLembreteVencimento(): ScheduledTask {
    return cron.schedule("0 8 * * *", async () => {
      try {
        Logger.info("[CRON] Executando: Lembretes de vencimento (3 dias)");
        const hoje = new Date();
        hoje.setUTCHours(0, 0, 0, 0);
        const em3Dias = new Date();
        em3Dias.setUTCDate(em3Dias.getUTCDate() + 3);
        em3Dias.setUTCHours(23, 59, 59, 999);

        const vencendo = await pagamentoRepository.getPagamentosVencendo(hoje, em3Dias);

        if (vencendo && vencendo.length > 0) {
          Logger.info(`[CRON] ${vencendo.length} pagamentos vencendo em 3 dias:`);
          vencendo.forEach((p: Pagamento) => {
            Logger.info(`  - ${p.descricao} | R$ ${p.valor} | ${p.data_vencimento}`);
          });
        } else {
          Logger.info("[CRON] Nenhum pagamento vencendo em 3 dias");
        }
      } catch (error) {
        Logger.error("[CRON] Erro ao buscar lembretes", error);
      }
    });
  }

  private static jobLimparBlacklist(): ScheduledTask {
    return cron.schedule("0 3 * * *", async () => {
      try {
        const removidos = await TokenBlacklist.destroy({
          where: { expiresAt: { [Op.lt]: new Date() } },
        });
        Logger.info(`[CRON] Blacklist: ${removidos} tokens expirados removidos`);
      } catch (error) {
        Logger.error("[CRON] Erro ao limpar blacklist de tokens", error);
      }
    });
  }
}
