export const swaggerSchemas = {
  User: {
    type: "object",
    required: ["nome", "email", "tipo_user"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID único do usuário",
      },
      nome: {
        type: "string",
        description: "Nome completo do usuário",
        example: "João Silva",
      },
      email: {
        type: "string",
        format: "email",
        description: "Email único do usuário",
        example: "joao@example.com",
      },
      tipo_user: {
        type: "string",
        enum: ["ADMIN", "ASSINANTE"],
        description: "Tipo de usuário",
        example: "ASSINANTE",
      },
    },
  },

  UserInput: {
    type: "object",
    required: ["nome", "email", "tipo_user"],
    properties: {
      nome: {
        type: "string",
        example: "João Silva",
      },
      email: {
        type: "string",
        format: "email",
        example: "joao@example.com",
      },
      tipo_user: {
        type: "string",
        enum: ["ADMIN", "ASSINANTE"],
        example: "ASSINANTE",
      },
    },
  },

  Assinatura: {
    type: "object",
    required: ["user_id", "valor", "periodicidade", "data_inicio"],
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
        example: 50.0,
      },
      periodicidade: {
        type: "string",
        enum: ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"],
        example: "MENSAL",
      },
      data_inicio: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00Z",
      },
    },
  },

  Pagamento: {
    type: "object",
    required: ["user_id", "valor", "data_pagamento", "forma_pagamento"],
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
        example: 50.0,
      },
      data_pagamento: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
      forma_pagamento: {
        type: "string",
        enum: ["PIX", "CARTAO", "CAIXA"],
        example: "PIX",
      },
      observacao: {
        type: "string",
        example: "Pagamento mensalidade janeiro",
      },
    },
  },

  PagamentoPendente: {
    type: "object",
    required: ["user_id", "valor", "data_vencimento"],
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
        example: 50.0,
      },
      data_vencimento: {
        type: "string",
        format: "date-time",
        example: "2024-02-01T00:00:00Z",
      },
      descricao: {
        type: "string",
        example: "Mensalidade fevereiro",
      },
      status: {
        type: "string",
        enum: ["PENDENTE", "ATRASADO", "CANCELADO"],
        example: "PENDENTE",
      },
    },
  },

  Historico: {
    type: "object",
    required: ["user_id", "tipo", "valor", "data"],
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
        example: "ENTRADA",
      },
      valor: {
        type: "number",
        format: "float",
        example: 50.0,
      },
      data: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
      descricao: {
        type: "string",
        example: "Pagamento mensalidade",
      },
    },
  },

  Error: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Erro ao processar requisição",
      },
      error: {
        type: "string",
        example: "Detalhes do erro",
      },
    },
  },
};
