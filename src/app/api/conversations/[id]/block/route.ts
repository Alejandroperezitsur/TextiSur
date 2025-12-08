import { NextRequest, NextResponse } from "next/server";
import { Conversation, Block, Store } from "@/models";
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

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUser(req);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversation = await Conversation.findByPk(id, {
            include: [{ model: Store, as: "store" }]
        });

        if (!conversation) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Determine who is being blocked
        let blockedId: number;
        // If current user is buyer, they are blocking the store owner
        if (conversation.buyerId === user.id) {
            const store = (conversation as any).store;
            if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
            blockedId = store.userId;
        } else {
            // Assume seller blocking buyer
            // Verify ownership
            const store = (conversation as any).store;
            if (store?.userId !== user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            blockedId = conversation.buyerId;
        }

        // Toggle Block
        // Check if block exists
        const existingBlock = await Block.findOne({
            where: {
                blockerId: user.id,
                blockedId: blockedId
            }
        });

        if (existingBlock) {
            await existingBlock.destroy();
            // Also unblock conversation if it was marked
            await conversation.update({ isBlocked: false, blockedBy: null as any });
            return NextResponse.json({ blocked: false });
        } else {
            await Block.create({
                blockerId: user.id,
                blockedId: blockedId
            } as any);
            // Update conversation to show it is blocked
            await conversation.update({ isBlocked: true, blockedBy: user.id } as any);
            return NextResponse.json({ blocked: true });
        }

    } catch (error) {
        console.error("Error blocking user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
