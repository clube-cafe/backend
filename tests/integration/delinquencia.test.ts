import request from 'supertest';
import express from 'express';
import delinquenciaRouter from '../../src/routes/delinquencia';
import authRouter from '../../src/routes/authRoutes';
import assinaturasRouter from '../../src/routes/assinaturas';
import pagamentosPendentesRouter from '../../src/routes/pagamentosPendentes';
import { errorHandler } from '../../src/middleware/errorHandler';
import testSequelize from '../setup';
import '../../src/models';
import { PlanoAssinatura } from '../../src/models/PlanoAssinatura';
import { PERIODO } from '../../src/models/enums';

type AssinaturaResponse = { 
  assinatura: { id: string }; 
  pagamentoPendente: { id: string; valor: number } 
};

describe('Delinquencia API Integration Tests', () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRouter);
  app.use('/assinaturas', assinaturasRouter);
  app.use('/pagamentos-pendentes', pagamentosPendentesRouter);
  app.use('/delinquencia', delinquenciaRouter);
  app.use(errorHandler);

  let userId: string;
  let authToken: string;

  beforeAll(async () => {
    await testSequelize.sync({ force: true });

    const plano = await PlanoAssinatura.create({
      nome: 'Plano Mensal Delinquencia',
      descricao: 'Plano mensal para testes de delinquencia',
      valor: 80.0,
      periodicidade: PERIODO.MENSAL,
    });

    const user = await request(app).post('/auth/register').send({
      nome: 'Cliente Inadimplente',
      email: 'inadimplente@example.com',
      password: '123456',
    });
    userId = user.body.user.id;
    authToken = user.body.token;

    // Criar assinatura (gera pagamento pendente automaticamente)
    const assinaturaRes = await request(app)
      .post('/assinaturas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: userId,
        plano_id: plano.id,
      });

    const body = assinaturaRes.body as AssinaturaResponse;
    const pagamentoPendenteId = body.pagamentoPendente?.id;

    // Criar outro pagamento pendente atrasado
    await request(app)
      .post('/pagamentos-pendentes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: userId,
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
      const res = await request(app)
        .get('/delinquencia')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /delinquencia/:user_id', () => {
    it('deve retornar relatório do usuário', async () => {
      const res = await request(app)
        .get(`/delinquencia/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });
});
