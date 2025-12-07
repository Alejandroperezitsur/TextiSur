import { NextRequest, NextResponse } from "next/server";
import { User, Subscription } from "@/models";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_123";

async function getUserFromRequest(req: NextRequest) {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return null;
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        return await User.findByPk(decoded.userId);
    } catch (error) {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const subscription = await req.json();

        // Check if subscription already exists
        const existingSub = await Subscription.findOne({
            where: {
                endpoint: subscription.endpoint,
            },
        });

        if (existingSub) {
            // Update if user changed (unlikely but possible)
            if (existingSub.userId !== user.id) {
                existingSub.userId = user.id;
                await existingSub.save();
            }
            return NextResponse.json({ success: true, message: "Subscription updated" });
        }

        // Create new subscription
        await Subscription.create({
            userId: user.id,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving subscription:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
