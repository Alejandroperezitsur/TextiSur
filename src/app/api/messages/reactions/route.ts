import { NextRequest, NextResponse } from "next/server";
import { MessageService } from "@/services/messageService";
import { NotificationService } from "@/services/notificationService";
import jwt from "jsonwebtoken";

async function getUser(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    try {
        return jwt.verify(token, process.env.JWT_SECRET || "secreto_super_seguro") as any;
    } catch (e) {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { messageId, emoji, conversationId } = body;

        if (!messageId || !emoji) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const reaction = await MessageService.addReaction(messageId, user.id, emoji);

        // Notify via socket
        const eventType = reaction ? "reaction:add" : "reaction:remove";
        const payload = { messageId, userId: user.id, emoji, conversationId };

        await NotificationService.notifyConversationUpdate(
            conversationId,
            eventType as any,
            payload
        );

        return NextResponse.json({ success: true, reaction });
    } catch (error) {
        console.error("Error reacting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
