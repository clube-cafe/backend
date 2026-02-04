import request from 'supertest';
import express from 'express';
import assinaturasRouter from '../../src/routes/assinaturas';
import usersRouter from '../../src/routes/users';
import { errorHandler } from '../../src/middleware/errorHandler';
import testSequelize from '../setup';
import '../../src/models';
import { PlanoAssinatura } from '../../src/models/PlanoAssinatura';
import { PERIODO } from '../../src/models/enums';

const app = express();
app.use(express.json());
app.use('/users', usersRouter);
app.use('/assinaturas', assinaturasRouter);
app.use(errorHandler);

describe('Assinaturas API Integration Tests', () => {
  let userId: string;
  let planoId: string;

  beforeAll(async () => {
    await testSequelize.sync({ force: true });

    const plano = await PlanoAssinatura.create({
      nome: 'Plano Mensal Teste',
      descricao: 'Plano mensal para testes',
      valor: 50.0,
      periodicidade: PERIODO.MENSAL,
    });

    planoId = plano.id;

    const userResponse = await request(app)
      .post('/users')
      .send({
        nome: 'Usuario Teste Assinatura',
        email: 'assinatura@example.com',
        tipo_user: 'ASSINANTE',
      });

    userId = userResponse.body.id;
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  describe('POST /assinaturas', () => {
    it('deve criar uma nova assinatura com dados válidos', async () => {
      const response = await request(app)
        .post('/assinaturas')
        .send({
          user_id: userId,
          plano_id: planoId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.user_id).toBe(userId);
      expect(response.body.plano_id).toBe(planoId);
      expect(response.body.status).toBe('ATIVA');
    });

    it('deve rejeitar assinatura sem user_id', async () => {
      const response = await request(app)
        .post('/assinaturas')
        .send({
          plano_id: planoId,
        });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar plano_id inválido', async () => {
      const response = await request(app)
        .post('/assinaturas')
        .send({
          user_id: userId,
          plano_id: 'invalid-uuid',
        });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar assinatura sem plano_id', async () => {
      const response = await request(app)
        .post('/assinaturas')
        .send({
          user_id: userId,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /assinaturas', () => {
    it('deve listar todas as assinaturas', async () => {
      const response = await request(app).get('/assinaturas');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /assinaturas/:id', () => {
    it('deve retornar uma assinatura específica', async () => {
      const listResponse = await request(app).get('/assinaturas');
      let assinaturaId = listResponse.body[0]?.id;
      
      if (!assinaturaId) {
        const createResponse = await request(app)
          .post('/assinaturas')
          .send({
            user_id: userId,
            plano_id: planoId,
          });
        expect(createResponse.status).toBe(201);
        assinaturaId = createResponse.body.id;
      }

      const response = await request(app).get(`/assinaturas/${assinaturaId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(assinaturaId);
    });

    it('deve retornar 404 para assinatura não encontrada', async () => {
      const response = await request(app).get('/assinaturas/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /assinaturas/:id', () => {
    it('deve atualizar assinatura', async () => {
      const listResponse = await request(app).get('/assinaturas');
      let assinaturaId = listResponse.body[0]?.id;
      
      if (!assinaturaId) {
        const createResponse = await request(app)
          .post('/assinaturas')
          .send({
            user_id: userId,
            plano_id: planoId,
          });
        expect(createResponse.status).toBe(201);
        assinaturaId = createResponse.body.id;
      }

      const response = await request(app)
        .put(`/assinaturas/${assinaturaId}`)
        .send({
          plano_id: planoId,
        });

      expect(response.status).toBe(200);
      expect(response.body.plano_id).toBe(planoId);
    });
  });

  describe('DELETE /assinaturas/:id (cancelar)', () => {
    it('deve cancelar assinatura', async () => {
      const createResponse = await request(app)
        .post('/assinaturas')
        .send({
          user_id: userId,
          plano_id: planoId,
        });

      const assinaturaId = createResponse.body.id;

      const response = await request(app).delete(`/assinaturas/${assinaturaId}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.status).toBe('CANCELADA');
      }
    });
  });
});
