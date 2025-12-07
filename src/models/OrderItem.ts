import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/sequelize";
import Order from "./Order";
import Product from "./Product";

interface OrderItemAttributes {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number; // Snapshot of price at purchase time
    createdAt?: Date;
    updatedAt?: Date;
}

type OrderItemCreationAttributes = Optional<
    OrderItemAttributes,
    "id" | "createdAt" | "updatedAt"
>;

class OrderItem
    extends Model<OrderItemAttributes, OrderItemCreationAttributes>
    implements OrderItemAttributes {
    declare id: number;
    declare orderId: number;
    declare productId: number;
    declare quantity: number;
    declare price: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

OrderItem.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: "orders", // Use string to avoid circular dependency issues if imported
                key: "id",
            },
        },
        productId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: "products",
                key: "id",
            },
        },
        quantity: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 1,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "OrderItem",
        tableName: "order_items",
        timestamps: true,
    }
);

export default OrderItem;
