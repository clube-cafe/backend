import "./User";
import "./Assinatura";
import "./Pagamento";
import "./PagamentoPendente";
import "./Historico";
import "./TokenBlacklist";
import { User } from "./User";
import { Assinatura } from "./Assinatura";
import { Pagamento } from "./Pagamento";
import { PagamentoPendente } from "./PagamentoPendente";
import { Historico } from "./Historico";

// Definir associações
User.hasMany(Assinatura, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
Assinatura.belongsTo(User, {
  foreignKey: "user_id",
});

User.hasMany(Pagamento, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
Pagamento.belongsTo(User, {
  foreignKey: "user_id",
});

User.hasMany(PagamentoPendente, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
PagamentoPendente.belongsTo(User, {
  foreignKey: "user_id",
});

User.hasMany(Historico, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
Historico.belongsTo(User, {
  foreignKey: "user_id",
});

Assinatura.hasMany(PagamentoPendente, {
  foreignKey: "assinatura_id",
  onDelete: "CASCADE",
});
PagamentoPendente.belongsTo(Assinatura, {
  foreignKey: "assinatura_id",
});
