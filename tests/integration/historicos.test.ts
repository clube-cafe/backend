import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import historicosRouter from '../../src/routes/historicos';
import authRouter from '../../src/routes/authRoutes';
import { errorHandler } from '../../src/middleware/errorHandler';
import { authenticate } from '../../src/middlewares/authMiddleware';
import testSequelize from '../setup';
import '../../src/models';
import { User } from '../../src/models/User';
import { TIPO_USER } from '../../src/models/enums';

describe('Historicos API Integration Tests', () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRouter);
  app.use('/historicos', authenticate, historicosRouter);
  app.use(errorHandler);

  let userId: string;
  let historicoId: string;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    await testSequelize.sync({ force: true });

    // Criar admin para endpoints restritos
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      nome: 'Admin Test',
      email: 'admin@historico.com',
      password: hashedPassword,
      tipo_user: TIPO_USER.ADMIN
    });
    adminToken = jwt.sign(
      { id: admin.id, email: 'admin@historico.com', tipo_user: 'ADMIN' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    const user = await request(app).post('/auth/register').send({
      nome: 'Usuario Historico',
      email: 'historico@example.com',
      password: '123456',
    });
    userId = user.body.user.id;
    authToken = user.body.token;
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  describe('POST /historicos', () => {
    it('deve criar um histórico', async () => {
      const res = await request(app)
        .post('/historicos')
        .set('Authorization', `Bearer ${authToken}`)
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
      const res = await request(app)
        .get('/historicos')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /historicos/:id', () => {
    it('deve obter histórico por id', async () => {
      const res = await request(app)
        .get(`/historicos/${historicoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(historicoId);
    });
  });

  describe('GET /historicos/tipo/:tipo', () => {
    it('deve filtrar por tipo', async () => {
      const res = await request(app)
        .get('/historicos/tipo/ENTRADA')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET totais', () => {
    it('deve retornar total de entradas', async () => {
      const res = await request(app)
        .get('/historicos/total/entradas')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });

    it('deve retornar total de saídas', async () => {
      const res = await request(app)
        .get('/historicos/total/saidas')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });

    it('deve retornar saldo', async () => {
      const res = await request(app)
        .get('/historicos/saldo')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /historicos/:id', () => {
    it('deve atualizar histórico', async () => {
      const res = await request(app)
        .put(`/historicos/${historicoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ descricao: 'Receita ajustada' });
      expect([200, 204]).toContain(res.status);
    });
  });

  describe('DELETE /historicos/:id', () => {
    it('deve deletar histórico', async () => {
      const res = await request(app)
        .delete(`/historicos/${historicoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect([200, 204, 404]).toContain(res.status);
    });
  });
});
