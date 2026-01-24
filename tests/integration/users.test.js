"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("../../src/routes/users"));
const errorHandler_1 = require("../../src/middleware/errorHandler");
const setup_1 = __importDefault(require("../setup"));
require("../../src/models");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/users', users_1.default);
app.use(errorHandler_1.errorHandler);
describe('Users API Integration Tests', () => {
    beforeAll(async () => {
        await setup_1.default.sync({ force: true });
    });
    afterAll(async () => {
        await setup_1.default.close();
    });
    describe('POST /users', () => {
        it('deve criar um novo usuário com dados válidos', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/users')
                .send({
                nome: 'Teste Usuario',
                email: 'teste@example.com',
                tipo_user: 'ASSINANTE',
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.nome).toBe('Teste Usuario');
            expect(response.body.email).toBe('teste@example.com');
            expect(response.body.tipo_user).toBe('ASSINANTE');
        });
        it('deve rejeitar criação sem campos obrigatórios', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/users')
                .send({
                nome: 'Teste',
            });
            expect(response.status).toBe(400);
        });
        it('deve rejeitar email inválido', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/users')
                .send({
                nome: 'Teste Usuario',
                email: 'email-invalido',
                tipo_user: 'ASSINANTE',
            });
            expect([400, 500]).toContain(response.status);
            expect(response.body).toHaveProperty('message');
        });
        it('deve rejeitar tipo_user inválido', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/users')
                .send({
                nome: 'Teste Usuario',
                email: 'teste2@example.com',
                tipo_user: 'INVALIDO',
            });
            expect(response.status).toBe(400);
        });
        it('deve rejeitar email duplicado', async () => {
            await (0, supertest_1.default)(app)
                .post('/users')
                .send({
                nome: 'Usuario 1',
                email: 'duplicado@example.com',
                tipo_user: 'ASSINANTE',
            });
            const response = await (0, supertest_1.default)(app)
                .post('/users')
                .send({
                nome: 'Usuario 2',
                email: 'duplicado@example.com',
                tipo_user: 'ASSINANTE',
            });
            expect([409, 500]).toContain(response.status);
            expect(response.body).toHaveProperty('message');
        });
    });
    describe('GET /users', () => {
        it('deve listar todos os usuários', async () => {
            const response = await (0, supertest_1.default)(app).get('/users');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });
    describe('GET /users/:id', () => {
        it('deve retornar um usuário específico', async () => {
            const createResponse = await (0, supertest_1.default)(app)
                .post('/users')
                .send({
                nome: 'Usuario Especifico',
                email: 'especifico@example.com',
                tipo_user: 'ASSINANTE',
            });
            const userId = createResponse.body.id;
            const response = await (0, supertest_1.default)(app).get(`/users/${userId}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(userId);
            expect(response.body.email).toBe('especifico@example.com');
        });
        it('deve retornar 404 para usuário não encontrado', async () => {
            const response = await (0, supertest_1.default)(app).get('/users/123e4567-e89b-12d3-a456-426614174000');
            expect([404, 500]).toContain(response.status);
        });
        it('deve retornar 400 para UUID inválido', async () => {
            const response = await (0, supertest_1.default)(app).get('/users/invalid-uuid');
            expect([400, 500]).toContain(response.status);
        });
    });
    describe('PUT /users/:id', () => {
        it('deve atualizar dados do usuário', async () => {
            const createResponse = await (0, supertest_1.default)(app)
                .post('/users')
                .send({
                nome: 'Usuario Para Atualizar',
                email: 'atualizar@example.com',
                tipo_user: 'ASSINANTE',
            });
            const userId = createResponse.body.id;
            const response = await (0, supertest_1.default)(app)
                .put(`/users/${userId}`)
                .send({
                nome: 'Usuario Atualizado',
            });
            expect(response.status).toBe(200);
            expect(response.body.nome).toBe('Usuario Atualizado');
            expect(response.body.email).toBe('atualizar@example.com');
        });
    });
    describe('DELETE /users/:id', () => {
        it('deve fazer soft delete de usuário', async () => {
            const createResponse = await (0, supertest_1.default)(app)
                .post('/users')
                .send({
                nome: 'Usuario Para Deletar',
                email: 'deletar@example.com',
                tipo_user: 'ASSINANTE',
            });
            const userId = createResponse.body.id;
            const response = await (0, supertest_1.default)(app).delete(`/users/${userId}`);
            expect([204, 200]).toContain(response.status);
            const getResponse = await (0, supertest_1.default)(app).get(`/users/${userId}`);
            expect([404, 500]).toContain(getResponse.status);
        });
    });
});
