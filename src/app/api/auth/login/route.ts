import { NextResponse } from "next/server";
import { User } from "@/models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: result.error.flatten() },
                { status: 400 }
            );
        }

        const { email, password } = result.data;

        const user = await User.findOne({ where: { email } });

        if (!user || !user.password) {
            return NextResponse.json(
                { message: "Credenciales inválidas" },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Credenciales inválidas" },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return NextResponse.json({
            message: "Inicio de sesión exitoso",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error en login:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
