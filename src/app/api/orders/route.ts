import { NextResponse } from "next/server";
import { Order, Product, User } from "@/models";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const orderSchema = z.object({
    items: z.array(
        z.object({
            id: z.number(),
            quantity: z.number(),
            price: z.number(),
        })
    ),
    shippingDetails: z.object({
        fullName: z.string(),
        address: z.string(),
        city: z.string(),
        zipCode: z.string(),
    }),
    total: z.number(),
});

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";

export async function POST(request: Request) {
    try {
        // 1. Verify User
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "No autorizado" },
                { status: 401 }
            );
        }

        let userId: number;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json(
                { message: "Token inválido" },
                { status: 401 }
            );
        }

        // 2. Validate Body
        const body = await request.json();
        const validation = orderSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: validation.error.errors },
                { status: 400 }
            );
        }

        const { items, total } = validation.data;

        // 3. Create Orders (One per item, as per current schema)
        // In a real app, we'd have an OrderHeader and OrderItems.
        // Here we simulate it by creating multiple Order records.

        const ordersToCreate = items.map((item) => ({
            userId,
            productId: item.id,
            quantity: item.quantity,
            total: item.price * item.quantity, // Total for this line item
            status: "pendiente" as "pendiente" | "enviado" | "entregado",
        }));

        await Order.bulkCreate(ordersToCreate);

        // Optional: Update Stock (if we had a stock field and logic)

        return NextResponse.json(
            { message: "Pedido creado exitosamente" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
