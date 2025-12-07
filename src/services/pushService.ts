import webpush from "web-push";
import { Subscription } from "@/models";
import { Op } from "sequelize";

// Initialize VAPID
// In production, these should come strictly from process.env
// For development/first-run, we might fallback or warn.
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "";

if (!publicVapidKey || !privateVapidKey) {
    console.warn("VAPID Keys not set. Push notifications will not work.");
} else {
    webpush.setVapidDetails(
        "mailto:support@textisur.com", // Should be a real email
        publicVapidKey,
        privateVapidKey
    );
}

export class PushService {
    /**
     * Send a notification to a specific user.
     * Handles finding all subscriptions for that user and cleaning up dead ones.
     */
    static async sendToUser(userId: number, payload: { title: string; body: string; url?: string; icon?: string }) {
        if (!publicVapidKey || !privateVapidKey) return { success: false, error: "Missing VAPID keys" };

        const subscriptions = await Subscription.findAll({
            where: { userId },
        });

        if (subscriptions.length === 0) return { success: true, sentCount: 0 };

        const notificationPayload = JSON.stringify(payload);
        let sentCount = 0;

        const promises = subscriptions.map(async (sub) => {
            try {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                };

                await webpush.sendNotification(pushSubscription, notificationPayload);
                sentCount++;
            } catch (error: any) {
                // 410 Gone: The subscription is no longer valid
                if (error.statusCode === 410 || error.statusCode === 404) {
                    console.log(`Cleaning up expired subscription for user ${userId}`);
                    await sub.destroy();
                } else {
                    console.error("Error sending push notification:", error);
                }
            }
        });

        await Promise.all(promises);
        return { success: true, sentCount };
    }
}
