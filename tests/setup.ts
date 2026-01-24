import { Sequelize } from "sequelize";

// Configuração de banco de dados para testes
// Usa SQLite em memória para testes mais rápidos
const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Mock do sequelize ANTES de importar os models
jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: testSequelize,
}));

export default testSequelize;
