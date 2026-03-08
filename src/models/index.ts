import "./User";
import "./Assinatura";
import "./Pagamento";
import "./Historico";
import "./TokenBlacklist";
import "./PlanoAssinatura";
import { User } from "./User";
import { Assinatura } from "./Assinatura";
import { Pagamento } from "./Pagamento";
import { Historico } from "./Historico";
import { PlanoAssinatura } from "./PlanoAssinatura";

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

User.hasMany(Historico, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
Historico.belongsTo(User, {
  foreignKey: "user_id",
});

Assinatura.hasMany(Pagamento, {
  foreignKey: "assinatura_id",
  onDelete: "CASCADE",
});
Pagamento.belongsTo(Assinatura, {
  foreignKey: "assinatura_id",
});

// Plano de Assinatura -> Assinatura
PlanoAssinatura.hasMany(Assinatura, {
  foreignKey: "plano_id",
  onDelete: "RESTRICT",
});
Assinatura.belongsTo(PlanoAssinatura, {
  foreignKey: "plano_id",
});
