import { NextRequest, NextResponse } from "next/server";
import { Product, Store } from "@/models";
import { Op } from "sequelize";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest"; // newest, price_asc, price_desc, popular

    const whereClause: any = {
        status: "Activo"
    };

    if (search) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
        ];
    }

    if (category) {
        whereClause.category = category;
    }

    if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
        if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    // Sorting
    let order: any = [["createdAt", "DESC"]];
    if (sort === "price_asc") order = [["price", "ASC"]];
    else if (sort === "price_desc") order = [["price", "DESC"]];
    else if (sort === "popular") order = [["rating", "DESC"]]; // Assuming rating proxy for popularity

    try {
        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            include: [
                { model: Store, as: "store", attributes: ["name", "city"] }
            ],
            limit,
            offset,
            order
        });

        return NextResponse.json({
            products: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
