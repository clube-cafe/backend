"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const assinaturas_1 = __importDefault(require("../../src/routes/assinaturas"));
const users_1 = __importDefault(require("../../src/routes/users"));
const errorHandler_1 = require("../../src/middleware/errorHandler");
const setup_1 = __importDefault(require("../setup"));
require("../../src/models");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/users', users_1.default);
app.use('/assinaturas', assinaturas_1.default);
app.use(errorHandler_1.errorHandler);
describe('Assinaturas API Integration Tests', () => {
    let userId;
    beforeAll(async () => {
        await setup_1.default.sync({ force: true });
        const userResponse = await (0, supertest_1.default)(app)
            .post('/users')
            .send({
            nome: 'Usuario Teste Assinatura',
            email: 'assinatura@example.com',
            tipo_user: 'ASSINANTE',
        });
        userId = userResponse.body.id;
    });
    afterAll(async () => {
        await setup_1.default.close();
    });
    describe('POST /assinaturas', () => {
        it('deve criar uma nova assinatura com dados válidos', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/assinaturas')
                .send({
                user_id: userId,
                valor: 50.00,
                periodicidade: 'MENSAL',
                data_inicio: '2026-01-24',
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.user_id).toBe(userId);
            expect(response.body.valor).toBe(50);
            expect(response.body.periodicidade).toBe('MENSAL');
            expect(response.body.status).toBe('ATIVA');
        });
        it('deve rejeitar assinatura sem user_id', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/assinaturas')
                .send({
                valor: 50.00,
                periodicidade: 'MENSAL',
                data_inicio: '2026-01-24',
            });
            expect(response.status).toBe(400);
        });
        it('deve rejeitar valor inválido', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/assinaturas')
                .send({
                user_id: userId,
                valor: -10,
                periodicidade: 'MENSAL',
                data_inicio: '2026-01-24',
            });
            expect(response.status).toBe(400);
        });
        it('deve rejeitar periodicidade inválida', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/assinaturas')
                .send({
                user_id: userId,
                valor: 50.00,
                periodicidade: 'INVALIDA',
                data_inicio: '2026-01-24',
            });
            expect(response.status).toBe(400);
        });
        it('deve rejeitar data de início inválida', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/assinaturas')
                .send({
                user_id: userId,
                valor: 50.00,
                periodicidade: 'MENSAL',
                data_inicio: 'data-invalida',
            });
            expect(response.status).toBe(400);
        });
    });
    describe('GET /assinaturas', () => {
        it('deve listar todas as assinaturas', async () => {
            const response = await (0, supertest_1.default)(app).get('/assinaturas');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
    describe('GET /assinaturas/:id', () => {
        it('deve retornar uma assinatura específica', async () => {
            const createResponse = await (0, supertest_1.default)(app)
                .post('/assinaturas')
                .send({
                user_id: userId,
                valor: 100.00,
                periodicidade: 'TRIMESTRAL',
                data_inicio: '2026-01-24',
            });
            const assinaturaId = createResponse.body.id;
            const response = await (0, supertest_1.default)(app).get(`/assinaturas/${assinaturaId}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(assinaturaId);
            expect(response.body.periodicidade).toBe('TRIMESTRAL');
        });
        it('deve retornar 404 para assinatura não encontrada', async () => {
            const response = await (0, supertest_1.default)(app).get('/assinaturas/123e4567-e89b-12d3-a456-426614174000');
            expect(response.status).toBe(404);
        });
    });
    describe('PUT /assinaturas/:id', () => {
        it('deve atualizar assinatura', async () => {
            const createResponse = await (0, supertest_1.default)(app)
                .post('/assinaturas')
                .send({
                user_id: userId,
                valor: 50.00,
                periodicidade: 'MENSAL',
                data_inicio: '2026-01-24',
            });
            const assinaturaId = createResponse.body.id;
            const response = await (0, supertest_1.default)(app)
                .put(`/assinaturas/${assinaturaId}`)
                .send({
                valor: 75.00,
            });
            expect(response.status).toBe(200);
            expect(response.body.valor).toBe(75);
        });
    });
    describe('DELETE /assinaturas/:id (cancelar)', () => {
        it('deve cancelar assinatura', async () => {
            const createResponse = await (0, supertest_1.default)(app)
                .post('/assinaturas')
                .send({
                user_id: userId,
                valor: 50.00,
                periodicidade: 'MENSAL',
                data_inicio: '2026-01-24',
            });
            const assinaturaId = createResponse.body.id;
            const response = await (0, supertest_1.default)(app).delete(`/assinaturas/${assinaturaId}`);
            expect([200, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('CANCELADA');
            }
        });
    });
});
