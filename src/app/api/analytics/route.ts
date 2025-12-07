import { NextRequest, NextResponse } from "next/server";
import { User, Store, Product, OrderItem } from "@/models";
import sequelize from "@/lib/sequelize";
import { Op } from "sequelize";
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

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user || user.role !== "vendedor") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get seller's stores
        const stores = await Store.findAll({
            where: { userId: user.id },
            attributes: ["id", "name"],
        });

        const storeIds = stores.map((s) => s.id);

        if (storeIds.length === 0) {
            return NextResponse.json({
                totalSales: 0,
                totalRevenue: 0,
                salesByDay: [],
                topProducts: [],
                salesByHour: []
            });
        }

        // Total Sales (count of items sold) and Revenue (sum of price * quantity)
        const totalStats = await OrderItem.findOne({
            attributes: [
                [sequelize.fn("COUNT", sequelize.col("OrderItem.id")), "totalSales"],
                [sequelize.literal("SUM(OrderItem.price * OrderItem.quantity)"), "totalRevenue"],
            ],
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: [],
                    where: { storeId: { [Op.in]: storeIds } },
                },
            ],
            raw: true,
        }) as any;

        // Sales by day (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesByDay = await OrderItem.findAll({
            attributes: [
                [sequelize.fn("DATE", sequelize.col("OrderItem.createdAt")), "date"],
                [sequelize.literal("SUM(OrderItem.price * OrderItem.quantity)"), "revenue"],
                [sequelize.fn("COUNT", sequelize.col("OrderItem.id")), "sales"],
            ],
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: [],
                    where: { storeId: { [Op.in]: storeIds } },
                },
            ],
            where: {
                createdAt: {
                    [Op.gte]: sevenDaysAgo,
                },
            },
            group: [sequelize.fn("DATE", sequelize.col("OrderItem.createdAt"))],
            order: [[sequelize.fn("DATE", sequelize.col("OrderItem.createdAt")), "ASC"]],
            raw: true,
        });

        // Sales by Hour (Heatmap)
        const salesByHour = await OrderItem.findAll({
            attributes: [
                [sequelize.fn("HOUR", sequelize.col("OrderItem.createdAt")), "hour"],
                [sequelize.fn("COUNT", sequelize.col("OrderItem.id")), "sales"]
            ],
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: [],
                    where: { storeId: { [Op.in]: storeIds } },
                },
            ],
            group: [sequelize.fn("HOUR", sequelize.col("OrderItem.createdAt"))],
            order: [[sequelize.fn("HOUR", sequelize.col("OrderItem.createdAt")), "ASC"]],
            raw: true,
        });

        // Top Products
        const topProducts = await OrderItem.findAll({
            attributes: [
                [sequelize.col("product.name"), "name"],
                [sequelize.fn("COUNT", sequelize.col("OrderItem.id")), "sales"], // Number of times ordered
                [sequelize.literal("SUM(OrderItem.quantity)"), "quantitySold"], // Total units sold
                [sequelize.literal("SUM(OrderItem.price * OrderItem.quantity)"), "revenue"],
            ],
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["name"],
                    where: { storeId: { [Op.in]: storeIds } },
                },
            ],
            group: ["product.id", "product.name"],
            order: [[sequelize.literal("quantitySold"), "DESC"]],
            limit: 5,
            raw: true,
        });

        const response = NextResponse.json({
            totalSales: parseInt(totalStats?.totalSales || 0),
            totalRevenue: parseFloat(totalStats?.totalRevenue || 0),
            salesByDay,
            salesByHour,
            topProducts,
        });

        // Cache Control (revalidate every 60s)
        response.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate");

        return response;

    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { error: "Error fetching analytics" },
            { status: 500 },
        );
    }
}
