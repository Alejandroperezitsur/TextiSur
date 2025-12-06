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
            console.log(`Notification sent to user_${userId}: ${type}`);
        } else {
            console.warn("Socket.io instance not found, notification skipped for now");
        }
    }

    static async notifyConversationUpdate(conversationId: number, type: "message:new" | "typing:start" | "typing:stop", payload: any) {
        const io = (global as any).io;
        if (io) {
            // In a real app, you might want to emit to specific users in the conversation
            // For now, emitting to the conversation room
            io.to(`conversation_${conversationId}`).emit(type, payload);
        }
    }
}
