import { Assinatura } from "../models/Assinatura";
import { PlanoAssinatura } from "../models/PlanoAssinatura";
import { PagamentoPendente } from "../models/PagamentoPendente";
import { Pagamento } from "../models/Pagamento";
import { STATUS } from "../models/enums";
import sequelize from "../config/database";
import { Op } from "sequelize";
import { Logger } from "../utils/Logger";

/**
 * Service para dashboard com otimizações de cache e queries paralelas
 */
export class DashboardService {
  private static cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  private isCacheValid(key: string): boolean {
    const cached = DashboardService.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_TTL;
  }

  async obterMetricas() {
    const cacheKey = "metricas";

    // Retorna do cache se válido
    if (this.isCacheValid(cacheKey)) {
      Logger.debug("Cache hit para metricas");
      return DashboardService.cache.get(cacheKey)?.data;
    }

    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const primeiroDiaMes = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1));
    const ultimoDiaMes = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1, 0));
    ultimoDiaMes.setUTCHours(23, 59, 59, 999);

    const [
      totalAssinaturas,
      receitaMesAtual,
      totalPendentes,
      totalAtrasados,
      valorPendenteSum,
      valorAtrasadoSum,
      distribuicaoPeriodicidade,
    ] = await Promise.all([
      Assinatura.count(),
      Pagamento.sum("valor", {
        where: {
          data_pagamento: {
            [Op.gte]: primeiroDiaMes,
            [Op.lte]: ultimoDiaMes,
          },
        },
      }),
      PagamentoPendente.count({
        where: { status: STATUS.PENDENTE },
      }),
      PagamentoPendente.count({
        where: { status: STATUS.ATRASADO },
      }),
      PagamentoPendente.sum("valor", {
        where: { status: STATUS.PENDENTE },
      }),
      PagamentoPendente.sum("valor", {
        where: { status: STATUS.ATRASADO },
      }),
      Assinatura.findAll({
        attributes: [
          [sequelize.col("PlanoAssinatura.periodicidade"), "periodicidade"],
          [sequelize.fn("COUNT", sequelize.col("Assinatura.id")), "quantidade"],
        ],
        include: [{ model: PlanoAssinatura, attributes: [] }],
        group: ["PlanoAssinatura.periodicidade"],
        raw: true,
      }),
    ]);

    const metricas = {
      resumo: {
        totalAssinaturas,
        receitaMesAtual: (receitaMesAtual as any) || 0,
      },
      pagamentos: {
        pendentes: totalPendentes,
        atrasados: totalAtrasados,
        valorPendente: (valorPendenteSum as any) || 0,
        valorAtrasado: (valorAtrasadoSum as any) || 0,
        valorTotalEmAberto: ((valorPendenteSum as any) || 0) + ((valorAtrasadoSum as any) || 0),
      },
      distribuicao: {
        periodicidade: distribuicaoPeriodicidade,
      },
    };

    // Armazena no cache
    DashboardService.cache.set(cacheKey, {
      data: metricas,
      timestamp: Date.now(),
    });

    return metricas;
  }

  async obterDetalhesAssinaturas() {
    const cacheKey = "detalhes-assinaturas";

    // Usa cache se válido
    if (this.isCacheValid(cacheKey)) {
      Logger.debug("Cache hit para detalhes-assinaturas");
      return DashboardService.cache.get(cacheKey)?.data;
    }

    const assinaturas = await Assinatura.findAll({
      attributes: [
        "id",
        "data_inicio",
        [sequelize.col("PlanoAssinatura.valor"), "valor"],
        [sequelize.col("PlanoAssinatura.periodicidade"), "periodicidade"],
      ],
      include: [{ model: PlanoAssinatura, attributes: [] }],
      raw: true,
      limit: 10,
      order: [["createdAt", "DESC"]],
    });

    const assinaturaIds = assinaturas.map((a: any) => a.id);

    const pendenciasMap = await PagamentoPendente.findAll({
      where: {
        status: { [Op.in]: [STATUS.PENDENTE, STATUS.ATRASADO] },
        assinatura_id: { [Op.in]: assinaturaIds },
      },
      attributes: ["valor", "data_vencimento", "status", "assinatura_id"],
      raw: true,
    });

    // Agrupa pendências por assinatura_id
    const pendenciasPorAssinatura = new Map<string, any[]>();
    pendenciasMap.forEach((p: any) => {
      if (!pendenciasPorAssinatura.has(p.assinatura_id)) {
        pendenciasPorAssinatura.set(p.assinatura_id, []);
      }
      pendenciasPorAssinatura.get(p.assinatura_id)!.push(p);
    });

    const assinaturasComPendentes = assinaturas.map((ass: any) => {
      const pendencias = pendenciasPorAssinatura.get(ass.id) || [];
      return {
        ...ass,
        pendenciasPendentes: pendencias.length,
        valorEmAberto: pendencias.reduce(
          (sum: number, p: any) => sum + parseFloat(p.valor as any),
          0
        ),
      };
    });

    DashboardService.cache.set(cacheKey, {
      data: assinaturasComPendentes,
      timestamp: Date.now(),
    });

    return assinaturasComPendentes;
  }

  async obterPagamentosPendentes() {
    const cacheKey = "pagamentos-pendentes";

    if (this.isCacheValid(cacheKey)) {
      Logger.debug("Cache hit para pagamentos-pendentes");
      return DashboardService.cache.get(cacheKey)?.data;
    }

    const pagamentos = await PagamentoPendente.findAll({
      where: { status: { [Op.in]: [STATUS.PENDENTE, STATUS.ATRASADO] } },
      attributes: ["id", "valor", "data_vencimento", "status", "descricao"],
      order: [["data_vencimento", "ASC"]],
      limit: 20,
      raw: true,
    });

    DashboardService.cache.set(cacheKey, {
      data: pagamentos,
      timestamp: Date.now(),
    });

    return pagamentos;
  }

  /**
   * Limpa o cache de forma manual se necessário
   */
  clearCache(key?: string): void {
    if (key) {
      DashboardService.cache.delete(key);
      Logger.info(`Cache limpo para chave: ${key}`);
    } else {
      DashboardService.cache.clear();
      Logger.info("Cache completamente limpo");
    }
  }
}
