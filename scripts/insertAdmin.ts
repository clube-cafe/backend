import sequelize from "../src/config/database";
import { UserRepository } from "../src/repository/UserRepository";
import { TIPO_USER } from "../src/models/enums";
import { Logger } from "../src/utils/Logger";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function insertAdmin() {
  try {
    await sequelize.authenticate();
    Logger.info("Conexão com o banco estabelecida com sucesso");

    const userRepository = new UserRepository();

    console.log("\n=== Criar usuário Administrador ===\n");

    const nome = await question("Digite o nome do admin: ");
    const email = await question("Digite o email do admin: ");
    const password = await question("Digite a senha do admin: ");

    if (!nome || !email || !password) {
      Logger.error("Todos os campos são obrigatórios!");
      process.exit(1);
    }

    // Verificar se já existe usuário com este email
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
      Logger.error(`Já existe um usuário com o email: ${email}`);
      process.exit(1);
    }

    const admin = await userRepository.createUser(nome, email, TIPO_USER.ADMIN, password);

    Logger.info(`✓ Administrador criado com sucesso!`);
    Logger.info(`ID: ${admin.id}`);
    Logger.info(`Nome: ${admin.nome}`);
    Logger.info(`Email: ${admin.email}`);
    Logger.info(`Tipo: ${admin.tipo_user}`);

    rl.close();
    process.exit(0);
  } catch (error) {
    Logger.error("Erro ao criar administrador:", error);
    rl.close();
    process.exit(1);
  }
}

insertAdmin();
