import { Conversation, Message, User, Product, Store } from "@/models";
import { Op } from "sequelize";

export class ChatService {
    static async getConversations(userId: number) {
        // Find conversations where user is buyer OR user is owner of the store
        // Need to find stores owned by user first
        const stores = await Store.findAll({ where: { userId } });
        const storeIds = stores.map(s => s.id);

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { buyerId: userId },
                    { storeId: { [Op.in]: storeIds } }
                ]
            },
            include: [
                { model: User, as: "buyer", attributes: ["id", "name", "email"] },
                { model: Store, as: "store", attributes: ["id", "name"] },
                { model: Product, as: "product", attributes: ["id", "name", "price", "images"] },
            ],
            order: [["lastMessageAt", "DESC"]],
        });

        // Enrich with last message
        const enriched = await Promise.all(conversations.map(async (conv) => {
            const lastMessage = await Message.findOne({
                where: { conversationId: conv.id },
                order: [["createdAt", "DESC"]],
            });
            return {
                ...conv.toJSON(),
                lastMessage
            };
        }));

        return enriched;
    }

    static async findOrCreateConversation(buyerId: number, storeId: number, productId?: number) {
        const [conversation, created] = await Conversation.findOrCreate({
            where: {
                buyerId,
                storeId,
                productId: (productId || null) as any
            },
            defaults: {
                buyerId,
                storeId,
                productId,
                lastMessageAt: new Date()
            }
        });
        return conversation;
    }

    static async getConversationDetails(conversationId: number, userId: number) {
        const conversation = await Conversation.findByPk(conversationId, {
            include: [
                { model: User, as: "buyer", attributes: ["id", "name"] },
                { model: Store, as: "store", include: [{ model: User, as: "owner" }] },
                { model: Product, as: "product" }
            ]
        });

        if (!conversation) return null;

        // Authorization check
        const isBuyer = conversation.buyerId === userId;
        const isStoreOwner = (conversation as any).store?.owner?.id === userId;

        if (!isBuyer && !isStoreOwner) return null;

        return conversation;
    }
}
