import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

export interface TokenBlacklistAttributes {
  id: string;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
}

export interface TokenBlacklistCreationAttributes extends Optional<
  TokenBlacklistAttributes,
  "id" | "createdAt"
> {}

export class TokenBlacklist
  extends Model<TokenBlacklistAttributes, TokenBlacklistCreationAttributes>
  implements TokenBlacklistAttributes
{
  public id!: string;
  public token!: string;
  public expiresAt!: Date;
  public createdAt?: Date;
}

TokenBlacklist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "token_blacklist",
    timestamps: true,
    indexes: [
      {
        fields: ["token"],
      },
      {
        fields: ["expiresAt"],
      },
    ],
  }
);
