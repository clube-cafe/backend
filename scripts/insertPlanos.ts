import sequelize from "../src/config/database";
import { PlanoAssinaturaRepository } from "../src/repository/PlanoAssinaturaRepository";
import { PERIODO } from "../src/models/enums";
import { Logger } from "../src/utils/Logger";

async function insertPlanos() {
  try {
    await sequelize.authenticate();
    Logger.info("Conexão com o banco estabelecida com sucesso");

    const planoRepository = new PlanoAssinaturaRepository();

    console.log("\n=== Inserindo Planos de Assinatura ===\n");

    const planos = [
      {
        nome: "Plano Mensal",
        descricao: "Café todos os meses com entrega garantida",
        preco: 50.0,
        periodicidade: PERIODO.MENSAL,
      },
      {
        nome: "Plano Trimestral",
        descricao: "3 meses de café com 10% de desconto",
        preco: 135.0,
        periodicidade: PERIODO.TRIMESTRAL,
      },
      {
        nome: "Plano Semestral",
        descricao: "6 meses de café com 15% de desconto",
        preco: 255.0,
        periodicidade: PERIODO.SEMESTRAL,
      },
      {
        nome: "Plano Anual",
        descricao: "12 meses de café com 20% de desconto",
        preco: 480.0,
        periodicidade: PERIODO.ANUAL,
      },
    ];

    for (const plano of planos) {
      try {
        const planoExistente = await planoRepository.getPlanoByName(plano.nome);
        
        if (planoExistente) {
          Logger.info(`⚠ Plano "${plano.nome}" já existe, pulando...`);
          continue;
        }

        const novoPLano = await planoRepository.createPlano(
          plano.nome,
          plano.descricao,
          plano.preco,
          plano.periodicidade
        );

        Logger.info(`✓ Plano "${plano.nome}" criado com sucesso!`);
        Logger.info(`  ID: ${novoPLano.id}`);
        Logger.info(`  Preço: R$ ${plano.preco.toFixed(2)}`);
        Logger.info(`  Periodicidade: ${plano.periodicidade}\n`);
      } catch (error: any) {
        Logger.error(`Erro ao criar plano "${plano.nome}":`, error.message);
      }
    }

    Logger.info("✓ Processo de inserção de planos concluído!");
    process.exit(0);
  } catch (error) {
    Logger.error("Erro ao inserir planos:", error);
    process.exit(1);
  }
}

insertPlanos();
