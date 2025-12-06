import { NextRequest, NextResponse } from "next/server";
import { Message, Conversation, User } from "@/models";
import { Op } from "sequelize";
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

export async function GET(req: NextRequest) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const query = url.searchParams.get("q");

        if (!query || query.length < 3) {
            return NextResponse.json({ error: "Query too short" }, { status: 400 });
        }

        // Search messages in conversations where user is a participant
        // Step 1: Get user conversations
        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { buyerId: user.id },
                    // Assuming we fetched storeIds... simplistic approach for now:
                    // This query might be expensive without proper joins or store ownership logic replicated.
                    // Let's do a join to check ownership or buyer
                ]
            },
            include: [{ model: User, as: 'buyer' }] // minimal include to filter
        });

        // Optimization: In a real app, use a dedicated search service or improved SQL.
        // For MVP/Demo: Search ALL messages where sender or receiver is part of user's context is tricky.
        // Simpler: Search messages where conversationId IN (user's conversations) AND content LIKE %query%

        // 1. Get Conversation IDs
        // Re-using ChatService logic or direct query
        // Let's simplify: Search messages and include conversation to check checks invalid access
        // This is inefficient but safer for now.

        const messages = await Message.findAll({
            where: {
                content: { [Op.like]: `%${query}%` }
            },
            include: [
                {
                    model: Conversation,
                    as: "conversation",
                    include: ["store", "buyer"]
                },
                {
                    model: User,
                    as: "sender",
                    attributes: ["id", "name"]
                }
            ],
            limit: 20
        });

        // Filter in memory for security (User must be buyer or store owner)
        const results = messages.filter(msg => {
            const conv = msg.conversation as any; // Type assertion
            if (!conv) return false;
            const isBuyer = conv.buyerId === user.id;
            const isStoreOwner = conv.store?.userId === user.id;
            return isBuyer || isStoreOwner;
        });

        return NextResponse.json(results);

    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
