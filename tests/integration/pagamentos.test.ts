import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pagamentosRouter from '../../src/routes/pagamentos';
import authRouter from '../../src/routes/authRoutes';
import assinaturasRouter from '../../src/routes/assinaturas';
import planosRouter from '../../src/routes/planos';
import { errorHandler } from '../../src/middleware/errorHandler';
import { authenticate } from '../../src/middlewares/authMiddleware';
import testSequelize from '../setup';
import '../../src/models';
import { PlanoAssinatura } from '../../src/models/PlanoAssinatura';
import { User } from '../../src/models/User';
import { PERIODO, TIPO_USER } from '../../src/models/enums';

type PagamentoResponse = { id: string; user_id: string };
type AssinaturaResponse = { 
  assinatura: { id: string }; 
  pagamentoPendente: { id: string; valor: number } 
};

describe('Pagamentos API Integration Tests', () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRouter);
  app.use('/pagamentos', authenticate, pagamentosRouter);
  app.use('/assinaturas', authenticate, assinaturasRouter);
  app.use('/planos', planosRouter);
  app.use(errorHandler);

  let userId: string;
  let planoId: string;
  let pagamentoPendenteId: string;
  let pagamentoId: string;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    await testSequelize.sync({ force: true });

    // Criar admin para endpoints restritos
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      nome: 'Admin Test',
      email: 'admin@pagamento.com',
      password: hashedPassword,
      tipo_user: TIPO_USER.ADMIN
    });
    adminToken = jwt.sign(
      { id: admin.id, email: 'admin@pagamento.com', tipo_user: 'ADMIN' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Criar plano
    const plano = await PlanoAssinatura.create({
      nome: 'Plano Teste Pagamento',
      descricao: 'Plano para testes de pagamento',
      valor: 50.0,
      periodicidade: PERIODO.MENSAL,
    });
    planoId = plano.id;

    // Criar usuário via register
    const user = await request(app).post('/auth/register').send({
      nome: 'Pagador',
      email: 'pagador@example.com',
      password: '123456',
    });
    userId = user.body.user.id;
    authToken = user.body.token;
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  describe('POST /pagamentos (via pagamento pendente)', () => {
    it('deve criar uma assinatura e pagamento pendente', async () => {
      const res = await request(app)
        .post('/assinaturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userId,
          plano_id: planoId,
        });

      expect([200, 201]).toContain(res.status);
      const body = res.body as AssinaturaResponse;
      expect(body.assinatura).toBeTruthy();
      expect(body.pagamentoPendente).toBeTruthy();
      expect(body.pagamentoPendente.valor).toBe(50);
      pagamentoPendenteId = body.pagamentoPendente.id;
    });

    it('deve registrar pagamento e ativar assinatura', async () => {
      const res = await request(app)
        .post('/pagamentos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pagamento_pendente_id: pagamentoPendenteId,
          forma_pagamento: 'PIX',
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.pagamento).toBeTruthy();
      expect(res.body.assinaturaAtivada).toBe(true);
      pagamentoId = res.body.pagamento.id;
    });

    it('deve rejeitar pagamento já realizado', async () => {
      const res = await request(app)
        .post('/pagamentos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pagamento_pendente_id: pagamentoPendenteId,
          forma_pagamento: 'PIX',
        });

      expect([400, 409]).toContain(res.status);
    });
  });

  describe('GET /pagamentos', () => {
    it('deve listar pagamentos', async () => {
      const res = await request(app)
        .get('/pagamentos')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /pagamentos/:id', () => {
    it('deve retornar pagamento por id', async () => {
      const res = await request(app)
        .get(`/pagamentos/${pagamentoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(pagamentoId);
    });
  });

  describe('GET /pagamentos/forma/:forma', () => {
    it('deve filtrar por forma de pagamento', async () => {
      const res = await request(app)
        .get('/pagamentos/forma/PIX')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /pagamentos/:id', () => {
    it('deve atualizar valor do pagamento', async () => {
      const res = await request(app)
        .put(`/pagamentos/${pagamentoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ valor: 75.5 });

      expect([200, 204]).toContain(res.status);
    });
  });

  describe('DELETE /pagamentos/:id', () => {
    it('deve deletar pagamento', async () => {
      const res = await request(app)
        .delete(`/pagamentos/${pagamentoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect([200, 204, 404]).toContain(res.status);
    });
  });
});
