import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/sequelize";

interface ReactionAttributes {
    id: number;
    messageId: number;
    userId: number;
    emoji: string;
    createdAt?: Date;
    updatedAt?: Date;
}

type ReactionCreationAttributes = Optional<
    ReactionAttributes,
    "id" | "createdAt" | "updatedAt"
>;

class Reaction
    extends Model<ReactionAttributes, ReactionCreationAttributes>
    implements ReactionAttributes {
    declare id: number;
    declare messageId: number;
    declare userId: number;
    declare emoji: string;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Reaction.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        messageId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        emoji: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Reaction",
        tableName: "reactions",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["messageId", "userId", "emoji"],
            },
        ],
    },
);

export default Reaction;
