import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

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

export async function POST(req: NextRequest) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validation: Size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (Max 5MB)" }, { status: 400 });
        }

        // Validation: Type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        // Save file
        const uniqueName = `${uuidv4()}${path.extname(file.name)}`;
        const filePath = path.join(uploadDir, uniqueName);
        await writeFile(filePath, buffer);

        const url = `/uploads/${uniqueName}`;

        return NextResponse.json({ url, type: file.type });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
