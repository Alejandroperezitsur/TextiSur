import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import { Order } from "@/models";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_123", {
    apiVersion: "2024-11-20.acacia" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    const sig = req.headers.get("stripe-signature");

    if (!sig || !endpointSecret) {
        console.error("Missing signature or endpoint secret");
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        const body = await req.text();
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;

            // Fulfill the order
            if (session.metadata?.orderId) {
                const orderId = session.metadata.orderId;

                try {
                    const order = await Order.findByPk(orderId);
                    if (order && order.status === "pendiente") {
                        await order.update({ status: "enviado" }); // Or a new status "pagado" if we add it enum
                        // Reduce stock here if we haven't already
                        console.log(`Order ${orderId} marked as paid.`);
                    }
                } catch (e) {
                    console.error("Error updating order:", e);
                }
            }
            break;

        // Handle other event types...
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
