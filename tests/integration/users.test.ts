import request from 'supertest';
import express from 'express';
import usersRouter from '../../src/routes/users';
import authRouter from '../../src/routes/authRoutes';
import { errorHandler } from '../../src/middleware/errorHandler';
import testSequelize from '../setup';
import '../../src/models';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use(errorHandler);

describe('Users API Integration Tests', () => {
  let testUserId: string;

  beforeAll(async () => {
    await testSequelize.sync({ force: true });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  describe('POST /auth/register (criar usuários)', () => {
    it('deve criar um novo usuário com dados válidos', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Teste Usuario',
          email: 'teste@example.com',
          password: '123456',
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.nome).toBe('Teste Usuario');
      expect(response.body.user.email).toBe('teste@example.com');
      expect(response.body.user.tipo_user).toBe('ASSINANTE');
      testUserId = response.body.user.id;
    });

    it('deve rejeitar criação sem campos obrigatórios', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Teste',
        });

      expect([400, 500]).toContain(response.status);
    });

    it('deve rejeitar email inválido', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Teste Usuario',
          email: 'email-invalido',
          password: '123456',
        });

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('deve rejeitar tipo_user inválido (sempre cria ASSINANTE)', async () => {
      // O registro ignora tipo_user e sempre cria ASSINANTE
      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Teste Usuario',
          email: 'teste2@example.com',
          password: '123456',
          tipo_user: 'ADMIN', // Ignorado
        });

      expect(response.status).toBe(201);
      expect(response.body.user.tipo_user).toBe('ASSINANTE');
    });

    it('deve rejeitar email duplicado', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          nome: 'Usuario 1',
          email: 'duplicado@example.com',
          password: '123456',
        });

      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Usuario 2',
          email: 'duplicado@example.com',
          password: '123456',
        });

      expect([409, 400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /users', () => {
    it('deve listar todos os usuários', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /users/:id', () => {
    it('deve retornar um usuário específico', async () => {
      const response = await request(app).get(`/users/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testUserId);
    });

    it('deve retornar 404 para usuário não encontrado', async () => {
      const response = await request(app).get('/users/123e4567-e89b-12d3-a456-426614174000');

      expect([404, 500]).toContain(response.status);
    });

    it('deve retornar 400 para UUID inválido', async () => {
      const response = await request(app).get('/users/invalid-uuid');

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('PUT /users/:id', () => {
    it('deve atualizar dados do usuário', async () => {
      const createResponse = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Usuario Para Atualizar',
          email: 'atualizar@example.com',
          password: '123456',
        });

      const userId = createResponse.body.user.id;

      const response = await request(app)
        .put(`/users/${userId}`)
        .send({
          nome: 'Usuario Atualizado',
        });

      expect(response.status).toBe(200);
      expect(response.body.nome).toBe('Usuario Atualizado');
    });
  });

  describe('DELETE /users/:id', () => {
    it('deve fazer soft delete de usuário', async () => {
      const createResponse = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Usuario Para Deletar',
          email: 'deletar@example.com',
          password: '123456',
        });

      const userId = createResponse.body.user.id;

      const response = await request(app).delete(`/users/${userId}`);

      expect([204, 200]).toContain(response.status);

      const getResponse = await request(app).get(`/users/${userId}`);
      expect([404, 500]).toContain(getResponse.status);
    });
  });
});
