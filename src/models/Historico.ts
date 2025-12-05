import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { TIPO } from "./enums";

export interface HistoricoAttributes {
  id: string;
  user_id: string;
  tipo: TIPO;
  valor: number;
  data: Date;
  descricao: string;
}

export interface HistoricoCreationAttributes extends Optional<HistoricoAttributes, "id"> {}

export class Historico
  extends Model<HistoricoAttributes, HistoricoCreationAttributes>
  implements HistoricoAttributes
{
  public id!: string;
  public user_id!: string;
  public tipo!: TIPO;
  public valor!: number;
  public data!: Date;
  public descricao!: string;
}

Historico.init(
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
    tipo: {
      type: DataTypes.ENUM(...Object.values(TIPO)),
      allowNull: false,
    },
    valor: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "historicos",
    timestamps: false,
  }
);
