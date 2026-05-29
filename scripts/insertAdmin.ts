import sequelize from "../src/config/database";
import { UserRepository } from "../src/repository/UserRepository";
import { TIPO_USER } from "../src/models/enums";
import { Logger } from "../src/utils/Logger";
import * as readline from "readline";

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const eq = arg.indexOf("=");
    if (eq !== -1) {
      out[arg.slice(2, eq)] = arg.slice(eq + 1);
    } else {
      out[arg.slice(2)] = argv[++i] ?? "";
    }
  }
  return out;
}

async function promptInteractive(): Promise<{ nome: string; email: string; password: string }> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q: string): Promise<string> => new Promise((r) => rl.question(q, r));

  console.log("\n=== Criar usuário Administrador ===\n");
  const nome = (await ask("Nome do admin: ")).trim();
  const email = (await ask("Email do admin: ")).trim();
  const password = await ask("Senha do admin: ");
  rl.close();
  return { nome, email, password };
}

async function insertAdmin() {
  try {
    await sequelize.authenticate();
    Logger.info("Conexão com o banco estabelecida com sucesso");

    const args = parseArgs(process.argv);
    let nome = args.nome ?? process.env.ADMIN_NOME ?? "";
    let email = args.email ?? process.env.ADMIN_EMAIL ?? "";
    let password = args.password ?? process.env.ADMIN_PASSWORD ?? "";

    const hasAll = nome && email && password;
    if (!hasAll && process.stdin.isTTY) {
      const answers = await promptInteractive();
      nome = nome || answers.nome;
      email = email || answers.email;
      password = password || answers.password;
    }

    if (!nome || !email || !password) {
      Logger.error(
        "Faltam dados. Forneça via flags (--nome --email --password), env (ADMIN_NOME/ADMIN_EMAIL/ADMIN_PASSWORD) ou modo interativo (TTY)."
      );
      process.exit(1);
    }

    const userRepository = new UserRepository();
    const existing = await userRepository.getUserByEmail(email);
    if (existing) {
      Logger.warn(`Já existe um usuário com o email: ${email}`);
      process.exit(0);
    }

    const admin = await userRepository.createUser(nome, email, TIPO_USER.ADMIN, password);
    Logger.info("✓ Administrador criado");
    Logger.info(
      `  id=${admin.id} nome=${admin.nome} email=${admin.email} tipo=${admin.tipo_user}`
    );
    process.exit(0);
  } catch (error) {
    Logger.error("Erro ao criar administrador:", error);
    process.exit(1);
  }
}

insertAdmin();
