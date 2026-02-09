export const swaggerSchemas = {
  // ========== USUÁRIOS ==========
  User: {
    type: "object",
    required: ["nome", "email", "password"],
    properties: {
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
      password: {
        type: "string",
        description: "Senha do usuário",
        example: "123456",
      },
    },
  },

  UserResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID único do usuário",
        example: "667b12bc-036b-4f7a-b7f9-46e1c855469d",
      },
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
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2026-02-08T10:30:00Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2026-02-08T10:30:00Z",
      },
    },
  },

  UserUpdateRequest: {
    type: "object",
    properties: {
      nome: {
        type: "string",
        example: "João Silva Atualizado",
      },
      email: {
        type: "string",
        format: "email",
        example: "joao.novo@example.com",
      },
      tipo_user: {
        type: "string",
        enum: ["ADMIN", "ASSINANTE"],
        description: "Tipo do usuário (somente ADMIN pode alterar)",
        example: "ASSINANTE",
      },
    },
  },

  // ========== AUTENTICAÇÃO ==========
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "joao@example.com",
      },
      password: {
        type: "string",
        example: "123456",
      },
    },
  },

  LoginResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Login realizado com sucesso",
      },
      token: {
        type: "string",
        description: "JWT token para autenticação",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
      user: {
        $ref: "#/components/schemas/UserResponse",
      },
    },
  },

  RegisterRequest: {
    type: "object",
    required: ["nome", "email", "password"],
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
      password: {
        type: "string",
        example: "123456",
      },
    },
  },

  RegisterResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Usuário criado com sucesso",
      },
      token: {
        type: "string",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
      user: {
        $ref: "#/components/schemas/UserResponse",
      },
    },
  },

  ChangePasswordRequest: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    properties: {
      currentPassword: {
        type: "string",
        example: "senhaAtual123",
      },
      newPassword: {
        type: "string",
        example: "novaSenha456",
      },
    },
  },

  ProfileUpdateRequest: {
    type: "object",
    properties: {
      nome: {
        type: "string",
        example: "João Silva Atualizado",
      },
      email: {
        type: "string",
        format: "email",
        example: "joao.novo@example.com",
      },
    },
  },

  // ========== ASSINATURAS ==========
  AssinaturaCreateRequest: {
    type: "object",
    required: ["user_id", "plano_id"],
    properties: {
      user_id: {
        type: "string",
        format: "uuid",
        description: "ID do usuário que será assinante",
        example: "667b12bc-036b-4f7a-b7f9-46e1c855469d",
      },
      plano_id: {
        type: "string",
        format: "uuid",
        description: "ID do plano de assinatura escolhido",
        example: "abc123-uuid-do-plano",
      },
    },
  },

  AssinaturaCreateResponse: {
    type: "object",
    properties: {
      assinatura: {
        $ref: "#/components/schemas/AssinaturaResponse",
      },
      pagamentoPendente: {
        $ref: "#/components/schemas/PagamentoPendenteResponse",
      },
    },
  },

  AssinaturaResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID da assinatura",
        example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      },
      user_id: {
        type: "string",
        format: "uuid",
        example: "667b12bc-036b-4f7a-b7f9-46e1c855469d",
      },
      plano_id: {
        type: "string",
        format: "uuid",
        example: "abc123-uuid-do-plano",
      },
      status: {
        type: "string",
        enum: ["PENDENTE", "ATIVA", "CANCELADA", "VENCIDA"],
        description: "Status da assinatura",
        example: "PENDENTE",
      },
      data_inicio: {
        type: "string",
        format: "date",
        description: "Data de início da assinatura",
        example: "2026-02-08",
      },
      data_fim: {
        type: "string",
        format: "date",
        description: "Data de fim da assinatura",
        example: "2026-03-08",
      },
      dia_vencimento: {
        type: "integer",
        description: "Dia do mês para vencimento",
        example: 10,
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  AssinaturaUpdateRequest: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["PENDENTE", "ATIVA", "CANCELADA", "VENCIDA"],
        example: "ATIVA",
      },
      data_fim: {
        type: "string",
        format: "date",
        example: "2026-12-31",
      },
      dia_vencimento: {
        type: "integer",
        example: 15,
      },
    },
  },

  AssinaturaComPendenciasRequest: {
    type: "object",
    required: ["user_id", "plano_id"],
    properties: {
      user_id: {
        type: "string",
        format: "uuid",
        example: "667b12bc-036b-4f7a-b7f9-46e1c855469d",
      },
      plano_id: {
        type: "string",
        format: "uuid",
        example: "abc123-uuid-do-plano",
      },
      dia_vencimento: {
        type: "integer",
        description: "Dia do mês para vencimento (1-28, padrão 10)",
        example: 10,
      },
    },
  },

  CancelarAssinaturaRequest: {
    type: "object",
    properties: {
      motivo: {
        type: "string",
        description: "Motivo do cancelamento",
        example: "Cliente solicitou cancelamento",
      },
    },
  },

  // ========== PLANOS DE ASSINATURA ==========
  PlanoAssinaturaCreateRequest: {
    type: "object",
    required: ["nome", "descricao", "valor", "periodicidade"],
    properties: {
      nome: {
        type: "string",
        description: "Nome do plano",
        example: "Plano Mensal Premium",
      },
      descricao: {
        type: "string",
        description: "Descrição do plano",
        example: "Café especial todos os meses",
      },
      valor: {
        type: "number",
        format: "float",
        description: "Valor do plano em R$",
        example: 50.0,
      },
      periodicidade: {
        type: "string",
        enum: ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"],
        description: "Periodicidade de cobrança",
        example: "MENSAL",
      },
    },
  },

  PlanoAssinaturaResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID do plano",
        example: "abc123-uuid-do-plano",
      },
      nome: {
        type: "string",
        example: "Plano Mensal Premium",
      },
      descricao: {
        type: "string",
        example: "Café especial todos os meses",
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
      ativo: {
        type: "boolean",
        description: "Se o plano está ativo",
        example: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  PlanoAssinaturaUpdateRequest: {
    type: "object",
    properties: {
      nome: {
        type: "string",
        example: "Plano Mensal Atualizado",
      },
      descricao: {
        type: "string",
        example: "Nova descrição do plano",
      },
      valor: {
        type: "number",
        format: "float",
        example: 60.0,
      },
      periodicidade: {
        type: "string",
        enum: ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"],
        example: "MENSAL",
      },
      ativo: {
        type: "boolean",
        example: true,
      },
    },
  },

  // ========== PAGAMENTOS ==========
  PagamentoCreateRequest: {
    type: "object",
    required: ["pagamento_pendente_id", "forma_pagamento"],
    properties: {
      pagamento_pendente_id: {
        type: "string",
        format: "uuid",
        description: "ID do pagamento pendente a ser pago",
        example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      },
      forma_pagamento: {
        type: "string",
        enum: ["PIX", "CARTAO", "BOLETO", "DINHEIRO"],
        description: "Forma de pagamento",
        example: "PIX",
      },
      observacao: {
        type: "string",
        description: "Observação opcional",
        example: "Pagamento via app",
      },
    },
  },

  PagamentoResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "xyz789-uuid-do-pagamento",
      },
      pagamento_pendente_id: {
        type: "string",
        format: "uuid",
        example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      },
      valor: {
        type: "number",
        format: "float",
        description: "Valor pago (obtido do pagamento pendente)",
        example: 50.0,
      },
      data_pagamento: {
        type: "string",
        format: "date-time",
        description: "Data/hora do pagamento (registrada pelo servidor)",
        example: "2026-02-08T10:30:00Z",
      },
      forma_pagamento: {
        type: "string",
        enum: ["PIX", "CARTAO", "BOLETO", "DINHEIRO"],
        example: "PIX",
      },
      observacao: {
        type: "string",
        example: "Pagamento via app",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  PagamentoCreateResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Pagamento registrado com sucesso. Assinatura ativada!",
      },
      pagamento: {
        $ref: "#/components/schemas/PagamentoResponse",
      },
      assinaturaAtivada: {
        type: "boolean",
        description: "Se uma assinatura foi ativada com este pagamento",
        example: true,
      },
    },
  },

  // ========== PAGAMENTOS PENDENTES ==========
  PagamentoPendenteCreateRequest: {
    type: "object",
    required: ["user_id", "valor", "data_vencimento", "descricao"],
    properties: {
      user_id: {
        type: "string",
        format: "uuid",
        example: "667b12bc-036b-4f7a-b7f9-46e1c855469d",
      },
      assinatura_id: {
        type: "string",
        format: "uuid",
        description: "ID da assinatura (opcional)",
        example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      },
      valor: {
        type: "number",
        format: "float",
        description: "Valor a pagar em R$",
        example: 50.0,
      },
      data_vencimento: {
        type: "string",
        format: "date",
        description: "Data de vencimento",
        example: "2026-02-10",
      },
      descricao: {
        type: "string",
        description: "Descrição da pendência",
        example: "Mensalidade Fevereiro 2026",
      },
    },
  },

  PagamentoPendenteResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID do pagamento pendente",
        example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      },
      user_id: {
        type: "string",
        format: "uuid",
        example: "667b12bc-036b-4f7a-b7f9-46e1c855469d",
      },
      assinatura_id: {
        type: "string",
        format: "uuid",
        example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      },
      valor: {
        type: "number",
        format: "float",
        example: 50.0,
      },
      data_vencimento: {
        type: "string",
        format: "date",
        example: "2026-02-10",
      },
      descricao: {
        type: "string",
        example: "Mensalidade Fevereiro 2026",
      },
      status: {
        type: "string",
        enum: ["PENDENTE", "ATRASADO", "PAGO", "CANCELADO"],
        example: "PENDENTE",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  PagamentoPendenteUpdateRequest: {
    type: "object",
    properties: {
      valor: {
        type: "number",
        format: "float",
        example: 55.0,
      },
      data_vencimento: {
        type: "string",
        format: "date",
        example: "2026-02-15",
      },
      descricao: {
        type: "string",
        example: "Mensalidade atualizada",
      },
    },
  },

  PagamentoPendenteStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["PENDENTE", "ATRASADO", "PAGO", "CANCELADO"],
        example: "ATRASADO",
      },
    },
  },

  // ========== HISTÓRICO ==========
  HistoricoCreateRequest: {
    type: "object",
    required: ["user_id", "tipo", "valor", "descricao"],
    properties: {
      user_id: {
        type: "string",
        format: "uuid",
        example: "667b12bc-036b-4f7a-b7f9-46e1c855469d",
      },
      tipo: {
        type: "string",
        enum: ["ENTRADA", "SAIDA"],
        description: "Tipo de transação",
        example: "ENTRADA",
      },
      valor: {
        type: "number",
        format: "float",
        description: "Valor da transação em R$",
        example: 50.0,
      },
      descricao: {
        type: "string",
        description: "Descrição da transação",
        example: "Pagamento mensalidade",
      },
    },
  },

  HistoricoResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "hist123-uuid",
      },
      user_id: {
        type: "string",
        format: "uuid",
        example: "667b12bc-036b-4f7a-b7f9-46e1c855469d",
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
        description: "Data da transação (registrada pelo servidor)",
        example: "2026-02-08T10:30:00Z",
      },
      descricao: {
        type: "string",
        example: "Pagamento mensalidade",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  HistoricoUpdateRequest: {
    type: "object",
    properties: {
      tipo: {
        type: "string",
        enum: ["ENTRADA", "SAIDA"],
        example: "SAIDA",
      },
      valor: {
        type: "number",
        format: "float",
        example: 25.0,
      },
      descricao: {
        type: "string",
        example: "Correção de valor",
      },
    },
  },

  // ========== DASHBOARD ==========
  DashboardMetricas: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Métricas obtidas com sucesso",
      },
      data: {
        type: "object",
        properties: {
          resumo: {
            type: "object",
            properties: {
              totalAssinaturas: {
                type: "integer",
                example: 150,
              },
              assinaturasVencidas: {
                type: "integer",
                example: 5,
              },
              receitaMesAtual: {
                type: "number",
                format: "float",
                example: 7500.0,
              },
            },
          },
          pagamentos: {
            type: "object",
            properties: {
              pendentes: {
                type: "integer",
                example: 20,
              },
              atrasados: {
                type: "integer",
                example: 3,
              },
              valorPendente: {
                type: "number",
                format: "float",
                example: 1000.0,
              },
              valorAtrasado: {
                type: "number",
                format: "float",
                example: 150.0,
              },
              valorTotalEmAberto: {
                type: "number",
                format: "float",
                example: 1150.0,
              },
            },
          },
        },
      },
    },
  },

  DashboardAssinaturas: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Detalhes obtidos com sucesso",
      },
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            assinatura: {
              $ref: "#/components/schemas/AssinaturaResponse",
            },
            usuario: {
              $ref: "#/components/schemas/UserResponse",
            },
            plano: {
              $ref: "#/components/schemas/PlanoAssinaturaResponse",
            },
            pendencias: {
              type: "integer",
              example: 2,
            },
          },
        },
      },
    },
  },

  DashboardPendentes: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Pagamentos obtidos com sucesso",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/PagamentoPendenteResponse",
        },
      },
    },
  },

  // ========== DELINQUÊNCIA ==========
  DelinquenciaRelatorio: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Relatório de inadimplência obtido com sucesso",
      },
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/UserResponse",
            },
            assinaturas: {
              type: "array",
              items: {
                $ref: "#/components/schemas/AssinaturaResponse",
              },
            },
            atrasos: {
              type: "object",
              properties: {
                quantidade: {
                  type: "integer",
                  example: 2,
                },
                valorTotal: {
                  type: "number",
                  format: "float",
                  example: 100.0,
                },
                diasMaiorAtraso: {
                  type: "integer",
                  example: 15,
                },
              },
            },
          },
        },
      },
    },
  },

  DelinquenciaUsuario: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Relatório do usuário obtido com sucesso",
      },
      data: {
        type: "object",
        properties: {
          usuario: {
            $ref: "#/components/schemas/UserResponse",
          },
          atrasos: {
            type: "array",
            items: {
              $ref: "#/components/schemas/PagamentoPendenteResponse",
            },
          },
          proximosPagamentos: {
            type: "array",
            items: {
              $ref: "#/components/schemas/PagamentoPendenteResponse",
            },
          },
          resumo: {
            type: "object",
            properties: {
              totalAssinaturas: {
                type: "integer",
                example: 1,
              },
              assinaturasAtivas: {
                type: "integer",
                example: 1,
              },
              totalAtrasado: {
                type: "number",
                format: "float",
                example: 100.0,
              },
              totalPendente: {
                type: "number",
                format: "float",
                example: 50.0,
              },
            },
          },
        },
      },
    },
  },

  // ========== TOTAIS E SALDOS ==========
  TotalResponse: {
    type: "object",
    properties: {
      total: {
        type: "number",
        format: "float",
        example: 5000.0,
      },
    },
  },

  SaldoResponse: {
    type: "object",
    properties: {
      saldo: {
        type: "number",
        format: "float",
        description: "Saldo atual (entradas - saídas)",
        example: 4500.0,
      },
    },
  },

  // ========== RESPOSTAS GENÉRICAS ==========
  SuccessMessage: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Operação realizada com sucesso",
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

  ValidationError: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Dados inválidos",
      },
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: {
              type: "string",
              example: "email",
            },
            message: {
              type: "string",
              example: "Email inválido",
            },
          },
        },
      },
    },
  },

  NotFoundError: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Recurso não encontrado",
      },
    },
  },

  UnauthorizedError: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Token não fornecido ou inválido",
      },
    },
  },

  ForbiddenError: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Acesso negado",
      },
    },
  },

  // Manter compatibilidade com código legado
  Assinatura: {
    $ref: "#/components/schemas/AssinaturaCreateRequest",
  },
  PlanoAssinatura: {
    $ref: "#/components/schemas/PlanoAssinaturaResponse",
  },
  Pagamento: {
    $ref: "#/components/schemas/PagamentoResponse",
  },
  PagamentoPendente: {
    $ref: "#/components/schemas/PagamentoPendenteResponse",
  },
  Historico: {
    $ref: "#/components/schemas/HistoricoResponse",
  },
};
