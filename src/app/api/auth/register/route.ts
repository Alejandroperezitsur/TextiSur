import { NextResponse } from "next/server";
import { User } from "@/models";
import bcrypt from "bcrypt";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(32),
    role: z.enum(["comprador", "vendedor"]),
    avatarUrl: z.string().nullable().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, password, role, avatarUrl } = result.data;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { message: "El correo ya está registrado" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            avatarUrl,
        });

        return NextResponse.json(
            { message: "Usuario registrado exitosamente", user: newUser },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error en registro:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
