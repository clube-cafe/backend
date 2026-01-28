import { PagamentoPendente } from "../models/PagamentoPendente";
import { Assinatura } from "../models/Assinatura";
import { User } from "../models/User";
import { STATUS, STATUS_ASSINATURA } from "../models/enums";
import { Op } from "sequelize";

export class DelinquenciaService {
  async obterAssinaturasEmAtraso() {
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    // Busca todas as pendências atrasadas
    const pagamentosAtrasados = await PagamentoPendente.findAll({
      where: {
        status: STATUS.ATRASADO,
        data_vencimento: { [Op.lt]: hoje },
      },
      attributes: ["id", "user_id", "valor", "data_vencimento"],
      raw: true,
    });

    if (pagamentosAtrasados.length === 0) {
      return [];
    }

    // Agrupa por user_id
    const atrasosPorUser = new Map<string, any>();

    pagamentosAtrasados.forEach((pagamento: any) => {
      const user_id = pagamento.user_id;
      if (!atrasosPorUser.has(user_id)) {
        atrasosPorUser.set(user_id, {
          user_id,
          pagamentos: [],
          valor_total_atrasado: 0,
          dias_maior_atraso: 0,
        });
      }

      const diasAtraso = Math.floor(
        (hoje.getTime() - new Date(pagamento.data_vencimento).getTime()) / (1000 * 60 * 60 * 24)
      );

      const registro = atrasosPorUser.get(user_id);
      registro.pagamentos.push({
        id: pagamento.id,
        valor: parseFloat(pagamento.valor as any),
        data_vencimento: pagamento.data_vencimento,
        dias_atraso: diasAtraso,
      });
      registro.valor_total_atrasado += parseFloat(pagamento.valor as any);
      registro.dias_maior_atraso = Math.max(registro.dias_maior_atraso, diasAtraso);
    });

    // Busca dados dos usuários e assinaturas
    const result = await Promise.all(
      Array.from(atrasosPorUser.values()).map(async (atraso: any) => {
        const user = await User.findByPk(atraso.user_id, {
          attributes: ["id", "nome", "email"],
          raw: true,
        });

        const assinaturas = await Assinatura.findAll({
          where: {
            user_id: atraso.user_id,
            status: STATUS_ASSINATURA.ATIVA,
          },
          attributes: ["id", "valor", "periodicidade"],
          raw: true,
        });

        return {
          user: {
            id: user?.id,
            nome: user?.nome,
            email: user?.email,
          },
          assinaturas: assinaturas,
          atrasos: {
            quantidade_pagamentos_atrasados: atraso.pagamentos.length,
            valor_total_atrasado: atraso.valor_total_atrasado,
            dias_maior_atraso: atraso.dias_maior_atraso,
            pagamentos_detalhes: atraso.pagamentos,
          },
        };
      })
    );

    return result.sort(
      (a: any, b: any) => b.atrasos.valor_total_atrasado - a.atrasos.valor_total_atrasado
    );
  }

  async obterRelatorioPorUser(user_id: string) {
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const user = await User.findByPk(user_id, {
      attributes: ["id", "nome", "email"],
      raw: true,
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const assinaturas = await Assinatura.findAll({
      where: { user_id },
      attributes: ["id", "valor", "periodicidade", "status"],
      raw: true,
    });

    const pagamentosAtrasados = await PagamentoPendente.findAll({
      where: {
        user_id,
        status: STATUS.ATRASADO,
        data_vencimento: { [Op.lt]: hoje },
      },
      attributes: ["id", "valor", "data_vencimento"],
      raw: true,
    });

    const pagamentosPendentes = await PagamentoPendente.findAll({
      where: {
        user_id,
        status: STATUS.PENDENTE,
        data_vencimento: { [Op.gte]: hoje },
      },
      attributes: ["id", "valor", "data_vencimento"],
      raw: true,
    });

    const valorTotalAssinaturasAtivas = assinaturas
      .filter((a: any) => a.status === STATUS_ASSINATURA.ATIVA)
      .reduce((sum: number, a: any) => sum + parseFloat(a.valor as any), 0);

    const valorTotalAtrasado = pagamentosAtrasados.reduce(
      (sum: number, p: any) => sum + parseFloat(p.valor as any),
      0
    );

    const valorTotalPendente = pagamentosPendentes.reduce(
      (sum: number, p: any) => sum + parseFloat(p.valor as any),
      0
    );

    return {
      user,
      resumo: {
        assinaturas_ativas: assinaturas.filter((a: any) => a.status === STATUS_ASSINATURA.ATIVA)
          .length,
        assinaturas_canceladas: assinaturas.filter(
          (a: any) => a.status === STATUS_ASSINATURA.CANCELADA
        ).length,
        valor_mensal_esperado: valorTotalAssinaturasAtivas,
      },
      atrasos: {
        quantidade: pagamentosAtrasados.length,
        valor_total: valorTotalAtrasado,
        pagamentos: pagamentosAtrasados.map((p: any) => ({
          id: p.id,
          valor: parseFloat(p.valor as any),
          data_vencimento: p.data_vencimento,
          dias_atraso: Math.floor(
            (hoje.getTime() - new Date(p.data_vencimento).getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
      },
      proximos_pagamentos: {
        quantidade: pagamentosPendentes.length,
        valor_total: valorTotalPendente,
        pagamentos: pagamentosPendentes
          .sort(
            (a: any, b: any) =>
              new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime()
          )
          .map((p: any) => ({
            id: p.id,
            valor: parseFloat(p.valor as any),
            data_vencimento: p.data_vencimento,
          })),
      },
    };
  }
}
