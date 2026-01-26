import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { TIPO_USER } from "./enums";

export interface UserAttributes {
  id: string;
  nome: string;
  email: string;
  password: string;
  tipo_user: TIPO_USER;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public nome!: string;
  public email!: string;
  public password!: string;
  public tipo_user!: TIPO_USER;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date | null;
}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo_user: {
      type: DataTypes.ENUM(...Object.values(TIPO_USER)),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    paranoid: true,
  }
);
