import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { PAGAMENTO_ENUM } from "./enums";

export interface PagamentoAttributes {
  id: string;
  user_id: string;
  valor: number;
  data_pagamento: Date;
  forma_pagamento: PAGAMENTO_ENUM;
  observacao: string | null;
}

export interface PagamentoCreationAttributes
  extends Optional<PagamentoAttributes, "id" | "observacao"> {}

export class Pagamento
  extends Model<PagamentoAttributes, PagamentoCreationAttributes>
  implements PagamentoAttributes
{
  public id!: string;
  public user_id!: string;
  public valor!: number;
  public data_pagamento!: Date;
  public forma_pagamento!: PAGAMENTO_ENUM;
  public observacao!: string | null;
}

Pagamento.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    valor: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    data_pagamento: {
      type: DataTypes.DATE,
      allowNull: false
    },
    forma_pagamento: {
      type: DataTypes.ENUM(...Object.values(PAGAMENTO_ENUM)),
      allowNull: false
    },
    observacao: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "pagamentos",
    timestamps: false
  }
);

