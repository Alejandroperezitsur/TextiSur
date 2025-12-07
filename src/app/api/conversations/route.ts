import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/services/chatService";
import jwt from "jsonwebtoken";

async function getUser(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        console.log("Auth Debug: No authorization header");
        return null;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto_super_seguro") as any;
        return decoded;
    } catch (e: any) {
        console.log("Auth Debug: Token verification failed:", e.message);
        return null;
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversations = await ChatService.getConversations(user.id);
        return NextResponse.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { storeId, productId } = body;

        // Note: buyerId is the current user
        if (!storeId) {
            return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
        }

        const conversation = await ChatService.findOrCreateConversation(user.id, storeId, productId);
        return NextResponse.json(conversation);
    } catch (error) {
        console.error("Error creating conversation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
