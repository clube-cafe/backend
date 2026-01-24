import request from 'supertest';
import express from 'express';
import pagamentosPendentesRouter from '../../src/routes/pagamentosPendentes';
import usersRouter from '../../src/routes/users';
import { errorHandler } from '../../src/middleware/errorHandler';
import testSequelize from '../setup';
import '../../src/models';

describe('Pagamentos Pendentes API Integration Tests', () => {
  const app = express();
  app.use(express.json());
  app.use('/users', usersRouter);
  app.use('/pagamentos-pendentes', pagamentosPendentesRouter);
  app.use(errorHandler);

  let userId: string;
  let pendenteId: string;

  beforeAll(async () => {
    await testSequelize.sync({ force: true });
    const user = await request(app).post('/users').send({
      nome: 'Cliente Pendencia',
      email: 'pendente@example.com',
      tipo_user: 'ASSINANTE',
    });
    userId = user.body.id;
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  describe('POST /pagamentos-pendentes', () => {
    it('deve criar um pagamento pendente', async () => {
      const res = await request(app)
        .post('/pagamentos-pendentes')
        .send({
          user_id: userId,
          valor: 120.5,
          data_vencimento: '2026-02-10',
          descricao: 'Mensalidade',
        });

      expect([200, 201]).toContain(res.status);
      pendenteId = res.body.id;
      expect(pendenteId).toBeTruthy();
    });
  });

  describe('GET /pagamentos-pendentes', () => {
    it('deve listar pendências', async () => {
      const res = await request(app).get('/pagamentos-pendentes');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /pagamentos-pendentes/:id', () => {
    it('deve obter pendência por id', async () => {
      const res = await request(app).get(`/pagamentos-pendentes/${pendenteId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(pendenteId);
    });
  });

  describe('GET /pagamentos-pendentes/status/:status', () => {
    it('deve filtrar por status', async () => {
      const res = await request(app).get('/pagamentos-pendentes/status/PENDENTE');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PATCH /pagamentos-pendentes/:id/status', () => {
    it('deve atualizar status', async () => {
      const res = await request(app)
        .patch(`/pagamentos-pendentes/${pendenteId}/status`)
        .send({ status: 'ATRASADO' });
      expect([200, 204]).toContain(res.status);
    });
  });

  describe('DELETE /pagamentos-pendentes/:id', () => {
    it('deve remover pendência', async () => {
      const res = await request(app).delete(`/pagamentos-pendentes/${pendenteId}`);
      expect([200, 204, 404]).toContain(res.status);
    });
  });
});
