import { NextRequest, NextResponse } from "next/server";
import { MessageService } from "@/services/messageService";
import { ChatService } from "@/services/chatService";
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversationId = parseInt(params.id);
        if (isNaN(conversationId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Verify access
        const conversation = await ChatService.getConversationDetails(conversationId, user.id);
        if (!conversation) {
            return NextResponse.json({ error: "Not found or Forbidden" }, { status: 404 });
        }

        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        const messages = await MessageService.getMessages(conversationId, limit, offset);

        // Mark as read (async fire and forget)
        MessageService.markAsRead(conversationId, user.id).catch(console.error);

        return NextResponse.json(messages);

    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
