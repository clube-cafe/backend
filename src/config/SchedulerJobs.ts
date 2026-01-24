import cron from "node-cron";
import { PagamentoPendenteRepository } from "../repository/PagamentoPendenteRepository";
import { STATUS } from "../models/enums";
import { PagamentoPendente } from "../models/PagamentoPendente";

const pagamentoPendenteRepository = new PagamentoPendenteRepository();

export class SchedulerJobs {
  static iniciarJobs() {
    this.jobMarcarAtrasados();
    this.jobLembreteVencimento();
  }

  private static jobMarcarAtrasados() {
    cron.schedule("0 0 * * *", async () => {
      try {
        console.log("[CRON] Executando: Marcar pagamentos atrasados");

        const vencidos = await pagamentoPendenteRepository.getPagamentosVencidos();

        if (vencidos && vencidos.length > 0) {
          for (const pendente of vencidos) {
            if (pendente.status === STATUS.PENDENTE) {
              await pagamentoPendenteRepository.updateStatusPagamentoPendente(
                pendente.id,
                STATUS.ATRASADO
              );
            }
          }
          console.log(`[CRON] ${vencidos.length} pagamentos marcados como ATRASADO`);
        } else {
          console.log("[CRON] Nenhum pagamento atrasado encontrado");
        }
      } catch (error) {
        console.error("[CRON] Erro ao marcar atrasados:", error);
      }
    });
  }

  private static jobLembreteVencimento() {
    cron.schedule("0 8 * * *", async () => {
      try {
        console.log("[CRON] Executando: Lembretes de vencimento (3 dias)");
        const hoje = new Date();
        const em3Dias = new Date();
        em3Dias.setDate(em3Dias.getDate() + 3);

        const vencendo = await pagamentoPendenteRepository.getPagamentosVencendo(hoje, em3Dias);

        if (vencendo && vencendo.length > 0) {
          console.log(`[CRON] ${vencendo.length} pagamentos vencendo em 3 dias:`);
          vencendo.forEach((p: PagamentoPendente) => {
            console.log(`  - ${p.descricao} | R$ ${p.valor} | ${p.data_vencimento}`);
          });
        } else {
          console.log("[CRON] Nenhum pagamento vencendo em 3 dias");
        }
      } catch (error) {
        console.error("[CRON] Erro ao buscar lembretes:", error);
      }
    });
  }
}
