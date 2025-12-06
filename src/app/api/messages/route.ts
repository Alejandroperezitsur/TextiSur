import { NextRequest, NextResponse } from "next/server";
import { Message, Conversation } from "@/models";
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
        const { conversationId, content } = body;

        if (!conversationId || !content) {
            return NextResponse.json({ error: "Missing conversationId or content" }, { status: 400 });
        }

        // Check if user is part of the conversation
        const conversation = await Conversation.findByPk(conversationId, {
            include: ["store", "buyer"]
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const isBuyer = conversation.buyerId === user.id;
        const storeOwnerId = (conversation as any).store?.userId;

        // Authorization
        if (!isBuyer && storeOwnerId !== user.id) {
            if ((conversation as any).store?.userId !== user.id) { // Double check if association didn't load properly
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        if (conversation.isBlocked) {
            return NextResponse.json({ error: "Conversation is blocked" }, { status: 403 });
        }

        // Use Service
        const message = await MessageService.createMessage({
            conversationId,
            senderId: user.id,
            content,
            // TODO: Handle type from body if we want mixed content support here
            type: body.type || "text",
            replyToId: body.replyToId
        });

        // Notify
        await NotificationService.notifyConversationUpdate(
            conversationId,
            "message:new",
            message
        );

        return NextResponse.json(message);
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
