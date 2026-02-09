import request from 'supertest';
import express from 'express';
import assinaturasRouter from '../../src/routes/assinaturas';
import authRouter from '../../src/routes/authRoutes';
import { errorHandler } from '../../src/middleware/errorHandler';
import { authenticate } from '../../src/middlewares/authMiddleware';
import testSequelize from '../setup';
import '../../src/models';
import { PlanoAssinatura } from '../../src/models/PlanoAssinatura';
import { User } from '../../src/models/User';
import { PERIODO, TIPO_USER } from '../../src/models/enums';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/assinaturas', authenticate, assinaturasRouter);
app.use(errorHandler);

type AssinaturaResponse = { 
  assinatura: { id: string; status: string; user_id: string; plano_id: string }; 
  pagamentoPendente: { id: string; valor: number } 
};

describe('Assinaturas API Integration Tests', () => {
  let userId: string;
  let planoId: string;
  let assinaturaId: string;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    await testSequelize.sync({ force: true });

    const plano = await PlanoAssinatura.create({
      nome: 'Plano Mensal Teste',
      descricao: 'Plano mensal para testes',
      valor: 50.0,
      periodicidade: PERIODO.MENSAL,
    });

    planoId = plano.id;

    // Criar admin diretamente no banco
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      nome: 'Admin Teste',
      email: 'admin@test.com',
      password: hashedPassword,
      tipo_user: TIPO_USER.ADMIN,
    });

    // Login como admin para obter token
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'admin123',
      });
    adminToken = adminLogin.body.token;

    // Criar usuário via register
    const userResponse = await request(app)
      .post('/auth/register')
      .send({
        nome: 'Usuario Teste Assinatura',
        email: 'assinatura@example.com',
        password: '123456',
      });

    userId = userResponse.body.user.id;
    authToken = userResponse.body.token;
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  describe('POST /assinaturas', () => {
    it('deve criar uma nova assinatura com status PENDENTE e pagamento pendente', async () => {
      const response = await request(app)
        .post('/assinaturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userId,
          plano_id: planoId,
        });

      expect(response.status).toBe(201);
      const body = response.body as AssinaturaResponse;
      expect(body.assinatura).toBeTruthy();
      expect(body.assinatura.user_id).toBe(userId);
      expect(body.assinatura.plano_id).toBe(planoId);
      expect(body.assinatura.status).toBe('PENDENTE');
      expect(body.pagamentoPendente).toBeTruthy();
      expect(body.pagamentoPendente.valor).toBe(50);
      assinaturaId = body.assinatura.id;
    });

    it('deve rejeitar assinatura quando já existe uma pendente', async () => {
      const response = await request(app)
        .post('/assinaturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userId,
          plano_id: planoId,
        });

      expect([409, 400]).toContain(response.status);
    });

    it('deve rejeitar assinatura sem user_id', async () => {
      const response = await request(app)
        .post('/assinaturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plano_id: planoId,
        });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar plano_id inválido', async () => {
      const response = await request(app)
        .post('/assinaturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userId,
          plano_id: 'invalid-uuid',
        });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar assinatura sem plano_id', async () => {
      const response = await request(app)
        .post('/assinaturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userId,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /assinaturas (Admin)', () => {
    it('deve listar todas as assinaturas como admin', async () => {
      const response = await request(app)
        .get('/assinaturas')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve rejeitar acesso de assinante', async () => {
      const response = await request(app)
        .get('/assinaturas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /assinaturas/:id', () => {
    it('deve retornar uma assinatura específica', async () => {
      const response = await request(app)
        .get(`/assinaturas/${assinaturaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(assinaturaId);
    });

    it('deve retornar 404 para assinatura não encontrada', async () => {
      const response = await request(app)
        .get('/assinaturas/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /assinaturas/:id (Admin)', () => {
    it('deve atualizar assinatura como admin', async () => {
      // Fazer novo login como admin para garantir token válido
      const adminLogin = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'admin123',
        });
      
      const response = await request(app)
        .put(`/assinaturas/${assinaturaId}`)
        .set('Authorization', `Bearer ${adminLogin.body.token}`)
        .send({
          plano_id: planoId,
        });

      expect(response.status).toBe(200);
      expect(response.body.plano_id).toBe(planoId);
    });

    it('deve permitir assinante atualizar sua própria assinatura', async () => {
      const response = await request(app)
        .put(`/assinaturas/${assinaturaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plano_id: planoId,
        });

      expect(response.status).toBe(200);
    });
  });
});
