import request from 'supertest';
import express from 'express';
import delinquenciaRouter from '../../src/routes/delinquencia';
import usersRouter from '../../src/routes/users';
import assinaturasRouter from '../../src/routes/assinaturas';
import pagamentosPendentesRouter from '../../src/routes/pagamentosPendentes';
import { errorHandler } from '../../src/middleware/errorHandler';
import testSequelize from '../setup';
import '../../src/models';

describe('Delinquencia API Integration Tests', () => {
  const app = express();
  app.use(express.json());
  app.use('/users', usersRouter);
  app.use('/assinaturas', assinaturasRouter);
  app.use('/pagamentos-pendentes', pagamentosPendentesRouter);
  app.use('/delinquencia', delinquenciaRouter);
  app.use(errorHandler);

  let userId: string;

  beforeAll(async () => {
    await testSequelize.sync({ force: true });

    const user = await request(app).post('/users').send({
      nome: 'Cliente Inadimplente',
      email: 'inadimplente@example.com',
      tipo_user: 'ASSINANTE',
    });
    userId = user.body.id;

    const assinatura = await request(app).post('/assinaturas').send({
      user_id: userId,
      valor: 80,
      periodicidade: 'MENSAL',
      data_inicio: '2026-01-01',
    });

    await request(app)
      .post('/pagamentos-pendentes')
      .send({
        user_id: userId,
        assinatura_id: assinatura.body.id,
        valor: 80,
        data_vencimento: '2025-12-01',
        descricao: 'Mensalidade atrasada',
        status: 'ATRASADO',
      });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  describe('GET /delinquencia', () => {
    it('deve retornar relatório geral', async () => {
      const res = await request(app).get('/delinquencia');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /delinquencia/:user_id', () => {
    it('deve retornar relatório do usuário', async () => {
      const res = await request(app).get(`/delinquencia/${userId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });
});
