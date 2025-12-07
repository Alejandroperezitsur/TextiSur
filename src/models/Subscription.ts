import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/sequelize";
import User from "./User";

interface SubscriptionAttributes {
    id: number;
    userId: number;
    endpoint: string;
    p256dh: string;
    auth: string;
    createdAt?: Date;
    updatedAt?: Date;
}

type SubscriptionCreationAttributes = Optional<
    SubscriptionAttributes,
    "id" | "createdAt" | "updatedAt"
>;

class Subscription
    extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
    implements SubscriptionAttributes {
    declare id: number;
    declare userId: number;
    declare endpoint: string;
    declare p256dh: string;
    declare auth: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Subscription.init(
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
        endpoint: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        p256dh: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        auth: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Subscription",
        tableName: "subscriptions",
        timestamps: true,
    }
);

export default Subscription;
