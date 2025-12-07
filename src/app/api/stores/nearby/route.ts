import { NextRequest, NextResponse } from "next/server";
import { Store } from "@/models";
import sequelize from "@/lib/sequelize";
import { Op } from "sequelize";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "50"); // km

    if (!lat || !lng) {
        return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
    }

    try {
        // Haversine formula calculation in SQL
        // 6371 is Earth radius in km
        const stores = await Store.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            6371 * acos(
                                cos(radians(${lat}))
                                * cos(radians(latitude))
                                * cos(radians(longitude) - radians(${lng}))
                                + sin(radians(${lat}))
                                * sin(radians(latitude))
                            )
                        )`),
                        "distance"
                    ]
                ]
            },
            where: sequelize.literal(`latitude IS NOT NULL AND longitude IS NOT NULL HAVING distance < ${radius}`),
            order: sequelize.col("distance"),
            limit: 20
        });

        return NextResponse.json(stores);
    } catch (error) {
        console.error("Error finding nearby stores:", error);
        // Fallback if DB doesn't support complex math functions or lat/lng not set
        return NextResponse.json([]);
    }
}
