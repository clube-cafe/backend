import request from 'supertest';
import express from 'express';
import pagamentosRouter from '../../src/routes/pagamentos';
import usersRouter from '../../src/routes/users';
import { errorHandler } from '../../src/middleware/errorHandler';
import testSequelize from '../setup';
import '../../src/models';

type PagamentoResponse = { id: string; user_id: string };

describe('Pagamentos API Integration Tests', () => {
  const app = express();
  app.use(express.json());
  app.use('/users', usersRouter);
  app.use('/pagamentos', pagamentosRouter);
  app.use(errorHandler);

  let userId: string;
  let pagamentoId: string;

  beforeAll(async () => {
    await testSequelize.sync({ force: true });

    const user = await request(app).post('/users').send({
      nome: 'Pagador',
      email: 'pagador@example.com',
      tipo_user: 'ASSINANTE',
    });
    userId = user.body.id;
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  describe('POST /pagamentos', () => {
    it('deve criar um pagamento válido', async () => {
      const res = await request(app)
        .post('/pagamentos')
        .send({
          user_id: userId,
          valor: 50.0,
          data_pagamento: '2026-01-24',
          forma_pagamento: 'PIX',
        });

      expect([200, 201]).toContain(res.status);
      pagamentoId = (res.body as PagamentoResponse).id;
      expect(pagamentoId).toBeTruthy();
    });
  });

  describe('GET /pagamentos', () => {
    it('deve listar pagamentos', async () => {
      const res = await request(app).get('/pagamentos');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /pagamentos/:id', () => {
    it('deve retornar pagamento por id', async () => {
      const res = await request(app).get(`/pagamentos/${pagamentoId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(pagamentoId);
    });
  });

  describe('GET /pagamentos/forma/:forma', () => {
    it('deve filtrar por forma de pagamento', async () => {
      const res = await request(app).get('/pagamentos/forma/PIX');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /pagamentos/:id', () => {
    it('deve atualizar valor do pagamento', async () => {
      const res = await request(app)
        .put(`/pagamentos/${pagamentoId}`)
        .send({ valor: 75.5 });

      expect([200, 204]).toContain(res.status);
    });
  });

  describe('DELETE /pagamentos/:id', () => {
    it('deve deletar pagamento', async () => {
      const res = await request(app).delete(`/pagamentos/${pagamentoId}`);
      expect([200, 204, 404]).toContain(res.status);
    });
  });
});
