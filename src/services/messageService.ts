import { Message, Conversation, Reaction, User } from "@/models";
import { Op } from "sequelize";

export class MessageService {
    static async createMessage(data: {
        conversationId: number;
        senderId: number;
        content: string;
        type?: "text" | "image" | "file" | "audio";
        attachmentUrl?: string;
        replyToId?: number;
    }) {
        // Validate conversation existence and participation (omitted for brevity, handled in controller/gateway)

        const message = await Message.create({
            conversationId: data.conversationId,
            senderId: data.senderId,
            content: data.content,
            type: data.type || "text",
            attachmentUrl: data.attachmentUrl,
            replyToId: data.replyToId,
            isRead: false
        });

        // Update conversation timestamp
        await Conversation.update(
            { lastMessageAt: new Date() },
            { where: { id: data.conversationId } }
        );

        return message;
    }

    static async getMessages(conversationId: number, limit = 50, offset = 0) {
        return Message.findAll({
            where: { conversationId },
            include: [
                { model: Reaction, as: "reactions", include: [{ model: User, as: "user", attributes: ["id", "name"] }] },
                { model: Message, as: "replyTo", include: [{ model: User, as: "sender", attributes: ["id", "name"] }] }
            ],
            order: [["createdAt", "DESC"]], // Recent first for pagination, backend should reverse if needed or frontend does
            limit,
            offset,
        });
    }

    static async markAsRead(conversationId: number, userId: number) {
        // Mark all messages in conversation not sent by user as read
        await Message.update(
            { isRead: true },
            {
                where: {
                    conversationId,
                    senderId: { [Op.ne]: userId },
                    isRead: false,
                },
            }
        );
    }

    static async addReaction(messageId: number, userId: number, emoji: string) {
        // Check if exists
        const existing = await Reaction.findOne({ where: { messageId, userId, emoji } });
        if (existing) {
            await existing.destroy();
            return null; // Toggled off
        }

        const reaction = await Reaction.create({ messageId, userId, emoji });
        return reaction;
    }
}
