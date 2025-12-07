import webpush from "web-push";
import { Subscription, Conversation, Store } from "@/models";
import { PushService } from "./pushService";
import { Op } from "sequelize";

// web-push is configured in PushService
// const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
// const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

export class NotificationService {
    static async notifyUser(userId: number, type: string, payload: any) {
        // Validation
        if (!userId) return;

        // Persist notification (Optional: Create Notification model if not exists)
        // await Notification.create({ ... });

        // Real-time send via Socket.io
        const io = (global as any).io;
        if (io) {
            io.to(`user_${userId}`).emit("notification", {
                type,
                payload,
                createdAt: new Date()
            });
            // console.log(`Notification sent to user_${userId}: ${type}`);
        }
    }

    static async notifyConversationUpdate(conversationId: number, type: "message:new" | "typing:start" | "typing:stop", payload: any) {
        const io = (global as any).io;
        if (io) {
            // In a real app, you might want to emit to specific users in the conversation
            // For now, emitting to the conversation room
            io.to(`conversation_${conversationId}`).emit(type, payload);
        }

        // Send Push Notification for new messages
        if (type === "message:new") {
            try {
                const conversation = await Conversation.findByPk(conversationId, {
                    include: [
                        { model: Store, as: "store" }
                    ]
                });

                if (!conversation) return;

                const buyerId = conversation.buyerId;
                const sellerId = (conversation as any).store?.userId;
                const senderId = payload.senderId;

                // Determine recipient: The one NOT sending the message
                const recipientId = senderId === buyerId ? sellerId : buyerId;

                if (recipientId) {
                    await PushService.sendToUser(recipientId, {
                        title: "Nuevo Mensaje",
                        body: payload.content ? payload.content.substring(0, 50) + (payload.content.length > 50 ? "..." : "") : "Has recibido un mensaje",
                        url: `/messages/${conversationId}`
                    });
                }

            } catch (error) {
                console.error("Error processing push notification:", error);
            }
        }
    }
}
