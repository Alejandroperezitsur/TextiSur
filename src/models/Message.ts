import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/sequelize";
// We need circular imports for types sometimes, but best to stick to association mixins or just declaring the type
// functionality. To avoid circular dependency issues in models/index.ts vs here, we can use `import type`
// or just `any` if lazy, but let's try to be specific.
import type Conversation from "./Conversation";
import type User from "./User";
import type Reaction from "./Reaction";

interface MessageAttributes {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    type: "text" | "image" | "file" | "audio";
    attachmentUrl?: string;
    replyToId?: number;
    isRead: boolean;
    isEdited: boolean;
    deletedBySender: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

type MessageCreationAttributes = Optional<
    MessageAttributes,
    "id" | "isRead" | "createdAt" | "updatedAt" | "type" | "attachmentUrl" | "replyToId" | "isEdited" | "deletedBySender"
>;

class Message
    extends Model<MessageAttributes, MessageCreationAttributes>
    implements MessageAttributes {
    declare id: number;
    declare conversationId: number;
    declare senderId: number;
    declare content: string;
    declare type: "text" | "image" | "file" | "audio";
    declare attachmentUrl?: string;
    declare replyToId?: number;
    declare isRead: boolean;
    declare isEdited: boolean;
    declare deletedBySender: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    // Associations
    declare conversation?: Conversation;
    declare sender?: User;
    declare reactions?: Reaction[];
    declare replyTo?: Message;
}

Message.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        conversationId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        senderId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true, // Can be null if it's just an attachment
        },
        type: {
            type: DataTypes.ENUM("text", "image", "file", "audio"),
            defaultValue: "text",
        },
        attachmentUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        replyToId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isEdited: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        deletedBySender: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        modelName: "Message",
        tableName: "messages",
        timestamps: true,
    },
);

export default Message;
