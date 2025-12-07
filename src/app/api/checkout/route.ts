import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import { Order, OrderItem, Product, User } from "@/models";
import jwt from "jsonwebtoken";

// Ideally this key should be in env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-11-20.acacia", // Use latest API version available
});

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_123";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let userId: number;
    let userEmail: string;
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");
        userEmail = user.email;
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { items } = body; // items: [{ productId, quantity }]

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in order" }, { status: 400 });
        }

        // Fetch products to ensure prices are correct (never trust client price)
        const lineItems = [];
        const orderItemsData = [];
        let total = 0;

        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) continue;

            // Check stock?
            // if (product.stock < item.quantity) ...

            const unitAmount = Math.round(product.price * 100); // Stripe expects cents

            lineItems.push({
                price_data: {
                    currency: "mxn",
                    product_data: {
                        name: product.name,
                        images: product.images ? [product.images[0]] : [], // Assuming array or string
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            });

            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
                // storeId: product.storeId (Optional for splitting)
            });

            total += product.price * item.quantity;
        }

        if (lineItems.length === 0) {
            return NextResponse.json({ error: "No valid items" }, { status: 400 });
        }

        // Create Order in DB as "pending"
        const order = await Order.create({
            userId,
            total,
            status: "pendiente",
        });

        // Create Order Items
        for (const item of orderItemsData) {
            await OrderItem.create({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            });
        }

        // Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${req.nextUrl.origin}/orders/${order.id}?success=true`,
            cancel_url: `${req.nextUrl.origin}/cart?canceled=true`,
            customer_email: userEmail,
            metadata: {
                orderId: order.id.toString(),
                userId: userId.toString()
            }
        });

        // Update Order with session ID (stored in stripePaymentId usually, or a new field)
        await order.update({ stripePaymentId: session.id });

        return NextResponse.json({ sessionId: session.id, url: session.url });

    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
