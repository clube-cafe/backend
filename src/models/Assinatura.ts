import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { STATUS_ASSINATURA } from "./enums";

export interface AssinaturaAttributes {
  id: string;
  user_id: string;
  plano_id: string;
  data_inicio: Date;
  status: STATUS_ASSINATURA;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface AssinaturaCreationAttributes extends Optional<
  AssinaturaAttributes,
  "id" | "status" | "createdAt" | "updatedAt" | "deletedAt"
> {}

export class Assinatura
  extends Model<AssinaturaAttributes, AssinaturaCreationAttributes>
  implements AssinaturaAttributes
{
  public id!: string;
  public user_id!: string;
  public plano_id!: string;
  public data_inicio!: Date;
  public status!: STATUS_ASSINATURA;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date | null;
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
    plano_id: {
      type: DataTypes.UUID,
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
    paranoid: true,
  }
);
