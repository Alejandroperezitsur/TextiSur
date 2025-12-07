import { NextRequest, NextResponse } from "next/server";
import { PushService } from "@/services/pushService";
import { User } from "@/models";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_123";

// This endpoint allows manually sending a push notification (e.g., for testing or admin tools)
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let senderId: number;
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        senderId = decoded.userId;
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    try {
        const { userId, title, body, url } = await req.json();

        // Validation (In real app, check if sender has permission to notify target)
        if (!userId || !title || !body) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await PushService.sendToUser(userId, { title, body, url });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
