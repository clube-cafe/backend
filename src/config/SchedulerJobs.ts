import cron from "node-cron";
import { PagamentoPendenteRepository } from "../repository/PagamentoPendenteRepository";
import { STATUS } from "../models/enums";
import { PagamentoPendente } from "../models/PagamentoPendente";
import { Logger } from "../utils/Logger";
import { TransactionHelper } from "./TransactionHelper";

const pagamentoPendenteRepository = new PagamentoPendenteRepository();

export class SchedulerJobs {
  static iniciarJobs() {
    this.jobMarcarAtrasados();
    this.jobLembreteVencimento();
  }

  private static jobMarcarAtrasados() {
    cron.schedule("0 0 * * *", async () => {
      try {
        Logger.info("[CRON] Executando: Marcar pagamentos atrasados");

        const vencidos = await pagamentoPendenteRepository.getPagamentosVencidos();
        const pendentesParaAtualizar = vencidos.filter((p) => p.status === STATUS.PENDENTE);

        if (pendentesParaAtualizar.length > 0) {
          await TransactionHelper.executeTransaction(async (transaction) => {
            await Promise.all(
              pendentesParaAtualizar.map((pendente) =>
                pagamentoPendenteRepository.updateStatusPagamentoPendente(
                  pendente.id,
                  STATUS.ATRASADO,
                  transaction
                )
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

  private static jobLembreteVencimento() {
    cron.schedule("0 8 * * *", async () => {
      try {
        Logger.info("[CRON] Executando: Lembretes de vencimento (3 dias)");
        const hoje = new Date();
        hoje.setUTCHours(0, 0, 0, 0);
        const em3Dias = new Date();
        em3Dias.setUTCDate(em3Dias.getUTCDate() + 3);
        em3Dias.setUTCHours(23, 59, 59, 999);

        const vencendo = await pagamentoPendenteRepository.getPagamentosVencendo(hoje, em3Dias);

        if (vencendo && vencendo.length > 0) {
          Logger.info(`[CRON] ${vencendo.length} pagamentos vencendo em 3 dias:`);
          vencendo.forEach((p: PagamentoPendente) => {
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
}
