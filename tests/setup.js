"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// Configuração de banco de dados para testes
// Usa SQLite em memória para testes mais rápidos
const testSequelize = new sequelize_1.Sequelize({
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
exports.default = testSequelize;
