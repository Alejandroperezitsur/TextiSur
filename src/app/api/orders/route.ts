import { NextRequest, NextResponse } from "next/server";
import { User, Order, OrderItem, Product } from "@/models";
import sequelize from "@/lib/sequelize";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_123";

async function getUser(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        return await User.findByPk(decoded.userId);
    } catch (e) {
        return null;
    }
}

export async function POST(req: NextRequest) {
    const transaction = await sequelize.transaction();
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { items, total } = body; // items: [{ productId, quantity, price }]

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in order" }, { status: 400 });
        }

        // Create Order
        const order = await Order.create({
            userId: user.id,
            total,
            status: "pendiente",
            stripePaymentId: "mock_stripe_id_" + Date.now()
        }, { transaction });

        // Create Order Items
        for (const item of items) {
            await OrderItem.create({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            }, { transaction });

            // Reduce stock (Optional, depending on business logic)
            // await Product.decrement('stock', { by: item.quantity, where: { id: item.productId }, transaction });
        }

        await transaction.commit();
        return NextResponse.json(order);

    } catch (error) {
        await transaction.rollback();
        console.error("Error creating order:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
