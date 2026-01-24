import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { STATUS } from "./enums";

export interface PagamentoPendenteAttributes {
  id: string;
  user_id: string;
  valor: number;
  data_vencimento: Date;
  descricao: string;
  status: STATUS;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface PagamentoPendenteCreationAttributes extends Optional<
  PagamentoPendenteAttributes,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
> {}

export class PagamentoPendente
  extends Model<PagamentoPendenteAttributes, PagamentoPendenteCreationAttributes>
  implements PagamentoPendenteAttributes
{
  public id!: string;
  public user_id!: string;
  public valor!: number;
  public data_vencimento!: Date;
  public descricao!: string;
  public status!: STATUS;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date | null;
}

PagamentoPendente.init(
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
  },
  {
    sequelize,
    tableName: "pagamentos_pendentes",
    timestamps: true,
    paranoid: true,
  }
);
