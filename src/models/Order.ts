import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/sequelize";
import User from "./User";

interface OrderAttributes {
  id: number;
  userId: number;
  stripePaymentId?: string;
  total: number;
  status: "pendiente" | "enviado" | "entregado";
  createdAt?: Date;
  updatedAt?: Date;
}

type OrderCreationAttributes = Optional<OrderAttributes, "id" | "createdAt" | "updatedAt">;

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  declare id: number;
  declare userId: number;
  declare stripePaymentId?: string;
  declare total: number;
  declare status: "pendiente" | "enviado" | "entregado";
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    stripePaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pendiente", "enviado", "entregado"),
      allowNull: false,
      defaultValue: "pendiente",
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true,
  }
);

export default Order;