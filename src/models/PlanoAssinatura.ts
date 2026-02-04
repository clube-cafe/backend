import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { PERIODO } from "./enums";

export interface PlanoAssinaturaAttributes {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  periodicidade: PERIODO;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface PlanoAssinaturaCreationAttributes extends Optional<
  PlanoAssinaturaAttributes,
  "id" | "ativo" | "createdAt" | "updatedAt" | "deletedAt"
> {}

export class PlanoAssinatura
  extends Model<PlanoAssinaturaAttributes, PlanoAssinaturaCreationAttributes>
  implements PlanoAssinaturaAttributes
{
  public id!: string;
  public nome!: string;
  public descricao!: string;
  public valor!: number;
  public periodicidade!: PERIODO;
  public ativo!: boolean;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date | null;
}

PlanoAssinatura.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
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
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "planos_assinatura",
    timestamps: true,
    paranoid: true,
  }
);
