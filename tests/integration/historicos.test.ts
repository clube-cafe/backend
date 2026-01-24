import request from 'supertest';
import express from 'express';
import historicosRouter from '../../src/routes/historicos';
import usersRouter from '../../src/routes/users';
import { errorHandler } from '../../src/middleware/errorHandler';
import testSequelize from '../setup';
import '../../src/models';

describe('Historicos API Integration Tests', () => {
  const app = express();
  app.use(express.json());
  app.use('/users', usersRouter);
  app.use('/historicos', historicosRouter);
  app.use(errorHandler);

  let userId: string;
  let historicoId: string;

  beforeAll(async () => {
    await testSequelize.sync({ force: true });
    const user = await request(app).post('/users').send({
      nome: 'Usuario Historico',
      email: 'historico@example.com',
      tipo_user: 'ASSINANTE',
    });
    userId = user.body.id;
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  describe('POST /historicos', () => {
    it('deve criar um histórico', async () => {
      const res = await request(app)
        .post('/historicos')
        .send({
          user_id: userId,
          tipo: 'ENTRADA',
          valor: 200,
          data: '2026-01-24',
          descricao: 'Receita mensal',
        });

      expect([200, 201]).toContain(res.status);
      historicoId = res.body.id;
      expect(historicoId).toBeTruthy();
    });
  });

  describe('GET /historicos', () => {
    it('deve listar históricos', async () => {
      const res = await request(app).get('/historicos');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /historicos/:id', () => {
    it('deve obter histórico por id', async () => {
      const res = await request(app).get(`/historicos/${historicoId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(historicoId);
    });
  });

  describe('GET /historicos/tipo/:tipo', () => {
    it('deve filtrar por tipo', async () => {
      const res = await request(app).get('/historicos/tipo/ENTRADA');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET totais', () => {
    it('deve retornar total de entradas', async () => {
      const res = await request(app).get('/historicos/total/entradas');
      expect(res.status).toBe(200);
    });

    it('deve retornar total de saídas', async () => {
      const res = await request(app).get('/historicos/total/saidas');
      expect(res.status).toBe(200);
    });

    it('deve retornar saldo', async () => {
      const res = await request(app).get('/historicos/saldo');
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /historicos/:id', () => {
    it('deve atualizar histórico', async () => {
      const res = await request(app)
        .put(`/historicos/${historicoId}`)
        .send({ descricao: 'Receita ajustada' });
      expect([200, 204]).toContain(res.status);
    });
  });

  describe('DELETE /historicos/:id', () => {
    it('deve deletar histórico', async () => {
      const res = await request(app).delete(`/historicos/${historicoId}`);
      expect([200, 204, 404]).toContain(res.status);
    });
  });
});
