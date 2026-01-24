import { Assinatura } from "../models/Assinatura";
import { PagamentoPendente } from "../models/PagamentoPendente";
import { Pagamento } from "../models/Pagamento";
import { STATUS, PERIODO } from "../models/enums";
import sequelize from "../config/database";
import { Op } from "sequelize";

export class DashboardService {
  async obterMetricas() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Total de assinaturas ativas
    const totalAssinaturas = await Assinatura.count();

    // Receita do mês atual
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const receitaMesAtual = await Pagamento.sum("valor", {
      where: {
        data_pagamento: {
          [Op.gte]: primeiroDiaMes,
          [Op.lte]: ultimoDiaMes,
        },
      },
    });

    // Total de pagamentos pendentes
    const totalPendentes = await PagamentoPendente.count({
      where: { status: STATUS.PENDENTE },
    });

    // Total de pagamentos atrasados
    const totalAtrasados = await PagamentoPendente.count({
      where: { status: STATUS.ATRASADO },
    });

    // Valor total pendente + atrasado
    const valorPendenteSum =
      (await PagamentoPendente.sum("valor", {
        where: { status: STATUS.PENDENTE },
      })) || 0;

    const valorAtrasadoSum =
      (await PagamentoPendente.sum("valor", {
        where: { status: STATUS.ATRASADO },
      })) || 0;

    // Distribuição por periodicidade
    const distribuicaoPeriodicidade = await Assinatura.findAll({
      attributes: ["periodicidade", [sequelize.fn("COUNT", sequelize.col("id")), "quantidade"]],
      group: ["periodicidade"],
      raw: true,
    });

    return {
      resumo: {
        totalAssinaturas,
        receitaMesAtual: receitaMesAtual || 0,
      },
      pagamentos: {
        pendentes: totalPendentes,
        atrasados: totalAtrasados,
        valorPendente: valorPendenteSum,
        valorAtrasado: valorAtrasadoSum,
        valorTotalEmAberto: valorPendenteSum + valorAtrasadoSum,
      },
      distribuicao: {
        periodicidade: distribuicaoPeriodicidade,
      },
    };
  }

  async obterDetalhesAssinaturas() {
    const assinaturas = await Assinatura.findAll({
      attributes: ["id", "valor", "periodicidade", "data_inicio"],
      raw: true,
      limit: 10,
    });

    const assinaturasComPendentes = await Promise.all(
      assinaturas.map(async (ass: any) => {
        const pendentes = await PagamentoPendente.findAll({
          where: {
            status: { [Op.in]: [STATUS.PENDENTE, STATUS.ATRASADO] },
          },
          attributes: ["id", "valor", "data_vencimento", "status"],
          raw: true,
        });

        return {
          ...ass,
          pendenciasPendentes: pendentes.length,
          valorEmAberto: pendentes.reduce(
            (sum: number, p: any) => sum + parseFloat(p.valor as any),
            0
          ),
        };
      })
    );

    return assinaturasComPendentes;
  }

  async obterPagamentosPendentes() {
    const pagamentos = await PagamentoPendente.findAll({
      where: { status: { [Op.in]: [STATUS.PENDENTE, STATUS.ATRASADO] } },
      attributes: ["id", "valor", "data_vencimento", "status", "descricao"],
      order: [["data_vencimento", "ASC"]],
      limit: 20,
      raw: true,
    });

    return pagamentos;
  }
}
