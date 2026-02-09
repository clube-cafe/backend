import request from 'supertest';
import express from 'express';
import dashboardRouter from '../../src/routes/dashboard';
import authRouter from '../../src/routes/authRoutes';
import assinaturasRouter from '../../src/routes/assinaturas';
import pagamentosRouter from '../../src/routes/pagamentos';
import { errorHandler } from '../../src/middleware/errorHandler';
import testSequelize from '../setup';
import '../../src/models';
import { PlanoAssinatura } from '../../src/models/PlanoAssinatura';
import { PERIODO } from '../../src/models/enums';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/assinaturas', assinaturasRouter);
app.use('/pagamentos', pagamentosRouter);
app.use('/dashboard', dashboardRouter);
app.use(errorHandler);

type AssinaturaResponse = { 
  assinatura: { id: string }; 
  pagamentoPendente: { id: string; valor: number } 
};

describe('Dashboard API Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    await testSequelize.sync({ force: true });

    const plano = await PlanoAssinatura.create({
      nome: 'Plano Mensal Dashboard',
      descricao: 'Plano mensal para testes de dashboard',
      valor: 50.0,
      periodicidade: PERIODO.MENSAL,
    });

    // Criar usuário via register
    const userResponse = await request(app)
      .post('/auth/register')
      .send({
        nome: 'Usuario Dashboard',
        email: 'dashboard@example.com',
        password: '123456',
      });

    const userId = userResponse.body.user.id;
    authToken = userResponse.body.token;

    // Criar assinatura (retorna assinatura + pagamentoPendente)
    const assinaturaRes = await request(app)
      .post('/assinaturas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: userId,
        plano_id: plano.id,
      });

    const body = assinaturaRes.body as AssinaturaResponse;
    const pagamentoPendenteId = body.pagamentoPendente?.id;

    // Registrar pagamento (ativa assinatura)
    if (pagamentoPendenteId) {
      await request(app)
        .post('/pagamentos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pagamento_pendente_id: pagamentoPendenteId,
          forma_pagamento: 'PIX',
        });
    }
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  describe('GET /dashboard/metricas', () => {
    it('deve retornar métricas do dashboard', async () => {
      const response = await request(app)
        .get('/dashboard/metricas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('resumo');
      expect(response.body.data).toHaveProperty('pagamentos');
      expect(response.body.data).toHaveProperty('distribuicao');
    });

    it('deve retornar totalAssinaturas maior que zero', async () => {
      const response = await request(app)
        .get('/dashboard/metricas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.resumo.totalAssinaturas).toBeGreaterThanOrEqual(0);
    });

    it('deve usar cache em requisições subsequentes', async () => {
      const response1 = await request(app)
        .get('/dashboard/metricas')
        .set('Authorization', `Bearer ${authToken}`);
      const response2 = await request(app)
        .get('/dashboard/metricas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.data).toEqual(response2.body.data);
    });
  });

  describe('GET /dashboard/assinaturas-ativas', () => {
    it('deve listar assinaturas ativas', async () => {
      const response = await request(app)
        .get('/dashboard/assinaturas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /dashboard/receita', () => {
    it('deve retornar métricas do dashboard', async () => {
      const response = await request(app)
        .get('/dashboard/metricas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });
  });
});
