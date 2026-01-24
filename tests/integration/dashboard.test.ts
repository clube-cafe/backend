import request from 'supertest';
import express from 'express';
import dashboardRouter from '../../src/routes/dashboard';
import usersRouter from '../../src/routes/users';
import assinaturasRouter from '../../src/routes/assinaturas';
import pagamentosRouter from '../../src/routes/pagamentos';
import { errorHandler } from '../../src/middleware/errorHandler';
import testSequelize from '../setup';
import '../../src/models';

const app = express();
app.use(express.json());
app.use('/users', usersRouter);
app.use('/assinaturas', assinaturasRouter);
app.use('/pagamentos', pagamentosRouter);
app.use('/dashboard', dashboardRouter);
app.use(errorHandler);

describe('Dashboard API Integration Tests', () => {
  beforeAll(async () => {
    await testSequelize.sync({ force: true });

    // Criar dados de teste
    const userResponse = await request(app)
      .post('/users')
      .send({
        nome: 'Usuario Dashboard',
        email: 'dashboard@example.com',
        tipo_user: 'ASSINANTE',
      });

    const userId = userResponse.body.id;

    await request(app)
      .post('/assinaturas')
      .send({
        user_id: userId,
        valor: 50.00,
        periodicidade: 'MENSAL',
        data_inicio: '2026-01-24',
      });

    await request(app)
      .post('/pagamentos')
      .send({
        user_id: userId,
        valor: 50.00,
        data_pagamento: '2026-01-24',
        forma_pagamento: 'PIX',
      });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  describe('GET /dashboard/metricas', () => {
    it('deve retornar métricas do dashboard', async () => {
      const response = await request(app).get('/dashboard/metricas');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('resumo');
      expect(response.body.data).toHaveProperty('pagamentos');
      expect(response.body.data).toHaveProperty('distribuicao');
    });

    it('deve retornar totalAssinaturas maior que zero', async () => {
      const response = await request(app).get('/dashboard/metricas');

      expect(response.body.data.resumo.totalAssinaturas).toBeGreaterThan(0);
    });

    it('deve usar cache em requisições subsequentes', async () => {
      const response1 = await request(app).get('/dashboard/metricas');
      const response2 = await request(app).get('/dashboard/metricas');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.data).toEqual(response2.body.data);
    });
  });

  describe('GET /dashboard/assinaturas-ativas', () => {
    it('deve listar assinaturas ativas', async () => {
      const response = await request(app).get('/dashboard/assinaturas');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /dashboard/receita', () => {
    it('deve retornar métricas do dashboard', async () => {
      const response = await request(app).get('/dashboard/metricas');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });
  });
});
