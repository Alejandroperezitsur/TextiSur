import sequelize from "../lib/sequelize";
import User from "../models/User";
import Store from "../models/Store";
import Product from "../models/Product";
import Order from "../models/Order";

async function seedDatabase() {
  try {
    await sequelize.sync({ force: true });

    const users = await User.bulkCreate([
      // Vendedores
      { name: "Denis", email: "denis@textisur.com", password: "password123", role: "vendedor" },
      { name: "Ana", email: "ana@textisur.com", password: "password123", role: "vendedor" },
      { name: "Carlos", email: "carlos@textisur.com", password: "password123", role: "vendedor" },
      // Compradores
      { name: "Lupita", email: "lupita@textisur.com", password: "password123", role: "comprador" },
      { name: "Juan", email: "juan@textisur.com", password: "password123", role: "comprador" },
      { name: "Maria", email: "maria@textisur.com", password: "password123", role: "comprador" },
    ] as any);

    const stores = await Store.bulkCreate([
      { name: "Moda Uriangato", description: "Ropa de moda para toda la familia en Uriangato.", city: "Uriangato", userId: users[0].id, slug: "moda-uriangato" },
      { name: "Estilo Moroleón", description: "Las últimas tendencias de la moda en Moroleón.", city: "Moroleón", userId: users[1].id, slug: "estilo-moroleon" },
      { name: "Ropa y Más", description: "Todo lo que necesitas para vestir bien.", city: "Uriangato", userId: users[2].id, slug: "ropa-y-mas" },
    ] as any);

    const products = await Product.bulkCreate([
      // Productos para Moda Uriangato
      { name: "Camisa Denim", description: "Camisa de mezclilla para hombre.", price: 199.99, stock: 50, sizes: JSON.stringify(["S", "M", "L"]), category: "Camisas", imageUrl: "https://picsum.photos/seed/product-1/600/600", status: "Activo", storeId: stores[0].id },
      { name: "Blusa Floral", description: "Blusa con estampado floral para mujer.", price: 149.99, stock: 60, sizes: JSON.stringify(["S", "M", "L"]), category: "Blusas", imageUrl: "https://picsum.photos/seed/product-2/600/600", status: "Activo", storeId: stores[0].id },
      { name: "Pantalón Cargo", description: "Pantalón cargo para hombre.", price: 249.99, stock: 40, sizes: JSON.stringify(["30", "32", "34"]), category: "Pantalones", imageUrl: "https://picsum.photos/seed/product-3/600/600", status: "Activo", storeId: stores[0].id },
      { name: "Vestido de Verano", description: "Vestido ligero para el verano.", price: 299.99, stock: 30, sizes: JSON.stringify(["S", "M", "L"]), category: "Vestidos", imageUrl: "https://picsum.photos/seed/product-4/600/600", status: "Activo", storeId: stores[0].id },

      // Productos para Estilo Moroleón
      { name: "Sudadera con Capucha", description: "Sudadera cómoda para el día a día.", price: 349.99, stock: 70, sizes: JSON.stringify(["S", "M", "L"]), category: "Sudaderas", imageUrl: "https://picsum.photos/seed/product-5/600/600", status: "Activo", storeId: stores[1].id },
      { name: "Zapatos Deportivos", description: "Zapatos para correr o para el gimnasio.", price: 499.99, stock: 80, sizes: JSON.stringify(["26", "27", "28"]), category: "Zapatos", imageUrl: "https://picsum.photos/seed/product-6/600/600", status: "Activo", storeId: stores[1].id },
      { name: "Gorra de Béisbol", description: "Gorra para protegerte del sol.", price: 99.99, stock: 100, sizes: JSON.stringify(["Unitalla"]), category: "Accesorios", imageUrl: "https://picsum.photos/seed/product-7/600/600", status: "Activo", storeId: stores[1].id },
      { name: "Jeans Skinny", description: "Jeans ajustados para mujer.", price: 399.99, stock: 50, sizes: JSON.stringify(["5", "7", "9"]), category: "Pantalones", imageUrl: "https://picsum.photos/seed/product-8/600/600", status: "Activo", storeId: stores[1].id },

      // Productos para Ropa y Más
      { name: "Playera Básica", description: "Playera de algodón en varios colores.", price: 79.99, stock: 120, sizes: JSON.stringify(["S", "M", "L"]), category: "Playeras", imageUrl: "https://picsum.photos/seed/product-9/600/600", status: "Activo", storeId: stores[2].id },
      { name: "Falda Plisada", description: "Falda corta plisada.", price: 199.99, stock: 60, sizes: JSON.stringify(["S", "M", "L"]), category: "Faldas", imageUrl: "https://picsum.photos/seed/product-10/600/600", status: "Activo", storeId: stores[2].id },
      { name: "Chamarra de Piel", description: "Chamarra de piel sintética.", price: 599.99, stock: 25, sizes: JSON.stringify(["S", "M", "L"]), category: "Chamarras", imageUrl: "https://picsum.photos/seed/product-11/600/600", status: "Activo", storeId: stores[2].id },
      { name: "Calcetines Deportivos", description: "Paquete de 3 pares de calcetines.", price: 49.99, stock: 200, sizes: JSON.stringify(["Unitalla"]), category: "Accesorios", imageUrl: "https://picsum.photos/seed/product-12/600/600", status: "Activo", storeId: stores[2].id },
    ] as any);

    await Order.bulkCreate([
      // Pedidos para Lupita
      { userId: users[3].id, productId: products[0].id, quantity: 2, total: 399.98, status: "enviado" },
      { userId: users[3].id, productId: products[4].id, quantity: 1, total: 349.99, status: "entregado" },

      // Pedidos para Juan
      { userId: users[4].id, productId: products[6].id, quantity: 3, total: 299.97, status: "pendiente" },

      // Pedidos para Maria
      { userId: users[5].id, productId: products[8].id, quantity: 5, total: 399.95, status: "entregado" },
      { userId: users[5].id, productId: products[10].id, quantity: 1, total: 599.99, status: "enviado" },
    ] as any);

    console.log("Base de datos poblada con éxito.");
  } catch (error) {
    console.error("Error al poblar la base de datos:", error);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();