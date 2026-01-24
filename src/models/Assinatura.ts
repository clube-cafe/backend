import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { PERIODO, STATUS_ASSINATURA } from "./enums";

export interface AssinaturaAttributes {
  id: string;
  user_id: string;
  valor: number;
  periodicidade: PERIODO;
  data_inicio: Date;
  status: STATUS_ASSINATURA;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssinaturaCreationAttributes extends Optional<
  AssinaturaAttributes,
  "id" | "status" | "createdAt" | "updatedAt"
> {}

export class Assinatura
  extends Model<AssinaturaAttributes, AssinaturaCreationAttributes>
  implements AssinaturaAttributes
{
  public id!: string;
  public user_id!: string;
  public valor!: number;
  public periodicidade!: PERIODO;
  public data_inicio!: Date;
  public status!: STATUS_ASSINATURA;
  public createdAt?: Date;
  public updatedAt?: Date;
}

Assinatura.init(
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
    periodicidade: {
      type: DataTypes.ENUM(...Object.values(PERIODO)),
      allowNull: false,
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(STATUS_ASSINATURA)),
      allowNull: false,
      defaultValue: STATUS_ASSINATURA.ATIVA,
    },
  },
  {
    sequelize,
    tableName: "assinaturas",
    timestamps: true,
  }
);
