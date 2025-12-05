import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "☕ Clube do Café - API",
      version: "1.0.0",
      description: "API para gestão financeira e administrativa do Clube do Café do LSD",
      contact: {
        name: "Time Clube do Café",
        url: "https://github.com/clube-cafe/backend",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor Local",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único do usuário",
            },
            nome: {
              type: "string",
              description: "Nome completo do usuário",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email único do usuário",
            },
            tipo_user: {
              type: "string",
              enum: ["ADMIN", "ASSINANTE"],
              description: "Tipo de usuário",
            },
          },
          required: ["nome", "email", "tipo_user"],
        },
        Assinatura: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            user_id: {
              type: "string",
              format: "uuid",
            },
            valor: {
              type: "number",
              format: "float",
            },
            periodicidade: {
              type: "string",
              enum: ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"],
            },
            data_inicio: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Pagamento: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            user_id: {
              type: "string",
              format: "uuid",
            },
            valor: {
              type: "number",
              format: "float",
            },
            data_pagamento: {
              type: "string",
              format: "date-time",
            },
            forma_pagamento: {
              type: "string",
              enum: ["PIX", "CARTAO", "CAIXA"],
            },
            observacao: {
              type: "string",
            },
          },
        },
        PagamentoPendente: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            user_id: {
              type: "string",
              format: "uuid",
            },
            valor: {
              type: "number",
              format: "float",
            },
            data_vencimento: {
              type: "string",
              format: "date-time",
            },
            descricao: {
              type: "string",
            },
            status: {
              type: "string",
              enum: ["PENDENTE", "ATRASADO", "CANCELADO"],
            },
          },
        },
        Historico: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            user_id: {
              type: "string",
              format: "uuid",
            },
            tipo: {
              type: "string",
              enum: ["ENTRADA", "SAIDA"],
            },
            valor: {
              type: "number",
              format: "float",
            },
            data: {
              type: "string",
              format: "date-time",
            },
            descricao: {
              type: "string",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
            error: {
              type: "string",
            },
          },
        },
      },
    },
  },
  apis: ["./src/index.ts", "./src/routes/**/*.ts"],
};

export const specs = swaggerJsdoc(options);
