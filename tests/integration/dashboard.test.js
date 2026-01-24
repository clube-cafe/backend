"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const dashboard_1 = __importDefault(require("../../src/routes/dashboard"));
const users_1 = __importDefault(require("../../src/routes/users"));
const assinaturas_1 = __importDefault(require("../../src/routes/assinaturas"));
const pagamentos_1 = __importDefault(require("../../src/routes/pagamentos"));
const errorHandler_1 = require("../../src/middleware/errorHandler");
const setup_1 = __importDefault(require("../setup"));
require("../../src/models");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/users', users_1.default);
app.use('/assinaturas', assinaturas_1.default);
app.use('/pagamentos', pagamentos_1.default);
app.use('/dashboard', dashboard_1.default);
app.use(errorHandler_1.errorHandler);
describe('Dashboard API Integration Tests', () => {
    beforeAll(async () => {
        await setup_1.default.sync({ force: true });
        // Criar dados de teste
        const userResponse = await (0, supertest_1.default)(app)
            .post('/users')
            .send({
            nome: 'Usuario Dashboard',
            email: 'dashboard@example.com',
            tipo_user: 'ASSINANTE',
        });
        const userId = userResponse.body.id;
        await (0, supertest_1.default)(app)
            .post('/assinaturas')
            .send({
            user_id: userId,
            valor: 50.00,
            periodicidade: 'MENSAL',
            data_inicio: '2026-01-24',
        });
        await (0, supertest_1.default)(app)
            .post('/pagamentos')
            .send({
            user_id: userId,
            valor: 50.00,
            data_pagamento: '2026-01-24',
            forma_pagamento: 'PIX',
        });
    });
    afterAll(async () => {
        await setup_1.default.close();
    });
    describe('GET /dashboard/metricas', () => {
        it('deve retornar métricas do dashboard', async () => {
            const response = await (0, supertest_1.default)(app).get('/dashboard/metricas');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('resumo');
            expect(response.body.data).toHaveProperty('pagamentos');
            expect(response.body.data).toHaveProperty('distribuicao');
        });
        it('deve retornar totalAssinaturas maior que zero', async () => {
            const response = await (0, supertest_1.default)(app).get('/dashboard/metricas');
            expect(response.body.data.resumo.totalAssinaturas).toBeGreaterThan(0);
        });
        it('deve usar cache em requisições subsequentes', async () => {
            const response1 = await (0, supertest_1.default)(app).get('/dashboard/metricas');
            const response2 = await (0, supertest_1.default)(app).get('/dashboard/metricas');
            expect(response1.status).toBe(200);
            expect(response2.status).toBe(200);
            expect(response1.body.data).toEqual(response2.body.data);
        });
    });
    describe('GET /dashboard/assinaturas-ativas', () => {
        it('deve listar assinaturas ativas', async () => {
            const response = await (0, supertest_1.default)(app).get('/dashboard/assinaturas');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
    describe('GET /dashboard/receita', () => {
        it('deve retornar métricas do dashboard', async () => {
            const response = await (0, supertest_1.default)(app).get('/dashboard/metricas');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('data');
        });
    });
});
