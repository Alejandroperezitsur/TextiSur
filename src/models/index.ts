import User from "./User";
import Store from "./Store";
import Product from "./Product";
import Order from "./Order";
import Conversation from "./Conversation";
import Message from "./Message";
import Reaction from "./Reaction";
import Block from "./Block";

// Define associations
User.hasMany(Store, { foreignKey: "userId", as: "stores" });
Store.belongsTo(User, { foreignKey: "userId", as: "owner" });

Store.hasMany(Product, { foreignKey: "storeId", as: "products" });
Product.belongsTo(Store, { foreignKey: "storeId", as: "store" });

User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

Product.hasMany(Order, { foreignKey: "productId", as: "orders" });

Order.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Conversation associations
Conversation.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });
Conversation.belongsTo(Store, { foreignKey: "storeId", as: "store" });
Conversation.belongsTo(Product, { foreignKey: "productId", as: "product" });
Conversation.hasMany(Message, { foreignKey: "conversationId", as: "messages" });
Conversation.belongsTo(User, { foreignKey: "blockedBy", as: "blocker" });

// Message associations
Message.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.hasMany(Reaction, { foreignKey: "messageId", as: "reactions" });
Message.belongsTo(Message, { foreignKey: "replyToId", as: "replyTo" });

// Reaction associations
Reaction.belongsTo(Message, { foreignKey: "messageId", as: "message" });
Reaction.belongsTo(User, { foreignKey: "userId", as: "user" });

// User associations (add reaction)
User.hasMany(Reaction, { foreignKey: "userId", as: "reactions" });

// Block associations
Block.belongsTo(User, { foreignKey: "blockerId", as: "blocker" });
Block.belongsTo(User, { foreignKey: "blockedId", as: "blocked" });
User.hasMany(Block, { foreignKey: "blockerId", as: "blockedUsers" });
User.hasMany(Block, { foreignKey: "blockedId", as: "blockedByUsers" });

// Inverse associations (Optional but useful)
User.hasMany(Conversation, { foreignKey: "buyerId", as: "conversationsAsBuyer" });
Store.hasMany(Conversation, { foreignKey: "storeId", as: "conversations" });

// Export models
export { User, Store, Product, Order, Conversation, Message, Block, Reaction };
