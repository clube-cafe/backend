import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { PAGAMENTO_ENUM, STATUS } from "./enums";

export interface PagamentoAttributes {
  id: string;
  user_id: string;
  assinatura_id?: string;
  valor: number;
  data_vencimento: Date;
  descricao: string;
  status: STATUS;
  forma_pagamento: PAGAMENTO_ENUM | null;
  data_pagamento: Date | null;
  observacao: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface PagamentoCreationAttributes extends Optional<
  PagamentoAttributes,
  | "id"
  | "assinatura_id"
  | "status"
  | "forma_pagamento"
  | "data_pagamento"
  | "observacao"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
> {}

export class Pagamento
  extends Model<PagamentoAttributes, PagamentoCreationAttributes>
  implements PagamentoAttributes
{
  public id!: string;
  public user_id!: string;
  public assinatura_id?: string;
  public valor!: number;
  public data_vencimento!: Date;
  public descricao!: string;
  public status!: STATUS;
  public forma_pagamento!: PAGAMENTO_ENUM | null;
  public data_pagamento!: Date | null;
  public observacao!: string | null;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date | null;
}

Pagamento.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assinatura_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    valor: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    data_vencimento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(STATUS)),
      allowNull: false,
      defaultValue: STATUS.PENDENTE,
    },
    forma_pagamento: {
      type: DataTypes.ENUM(...Object.values(PAGAMENTO_ENUM)),
      allowNull: true,
    },
    data_pagamento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    observacao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "pagamentos",
    timestamps: true,
    paranoid: true,
  }
);
